const fetch = require('node-fetch');
const { parse } = require('node-html-parser');

function parseName(metadataText) {
  // The first bold tags contain the name.
  const firstBold = metadataText.indexOf(']');
  const firstBoldEnd = metadataText.indexOf('[', firstBold);
  const name = metadataText.substring(firstBold + 1, firstBoldEnd);
  return name;
}

function parseRange(metadataText) {
  // Range looks like the following: "Range: [b]5 :bolt[/b]"
  const rangeSection = metadataText.substring(metadataText.indexOf('Range:'));
  const rangeBold = rangeSection.indexOf(']');
  const rangeSpace = rangeSection.indexOf(' ', rangeBold);
  const range = parseInt(rangeSection.substring(rangeBold + 1, rangeSpace), 10);
  return range;
}

function parsePointValue(metadataText) {
  // Points look like the following: "Points: [b]45[/b]"
  const pointsSection = metadataText.substring(metadataText.indexOf('Points:'));
  const pointsBold = pointsSection.indexOf(']');
  const pointsBoldEnd = pointsSection.indexOf('[', pointsBold);
  const points = parseInt(pointsSection.substring(pointsBold + 1, pointsBoldEnd), 10);
  return points;
}

function parseDial(dialText) {
  // Dials look like the following: "[click][slot=*]12[/slot][slot=*]1[/slot][slot=*]5[/slot][slot=*]2[/slot][/click]..."
  let dialInfo = dialText;
  const dial = [];
  const slotCategories = ['speed', 'attack', 'defense', 'damage'];
  const clickOffset = 7;
  let clickStart = dialInfo.indexOf('[click]');
  while (clickStart > -1) {
    const slotSectionEnd = dialInfo.indexOf('[/click]');
    let slotSection = dialInfo.substring(clickStart + clickOffset, slotSectionEnd);

    let slotStart = slotSection.indexOf(']');
    let slotIndex = 0;
    let slotValues = {};
    while (slotStart > -1) {
      const slotEnd = slotSection.indexOf('[/slot]');
      const slotValue = parseInt(slotSection.substring(slotStart + 1, slotEnd), 10);

      // Stop when we've hit KO clicks.
      if (!slotValue) {
        return dial;
      }

      slotValues = {
        ...slotValues,
        [slotCategories[slotIndex]]: slotValue,
      };
      slotSection = slotSection.substring(slotEnd + 7);
      slotStart = slotSection.indexOf(']');
      slotIndex += 1;
    }
    dial.unshift(slotValues);

    dialInfo = dialInfo.substring(slotSectionEnd + 8);
    clickStart = dialInfo.indexOf('[click]');
  }

  return dial;
}

async function parsePieceData(seriesCode, pieceId) {
  const url = `http://www.hcrealms.com/forum/units/units_bbcode.php?id=${seriesCode}${pieceId}`;

  const response = await fetch(url, {
    method: 'POST',
  });
  const responseText = await response.text();

  const root = parse(responseText);
  const infoText = root.querySelector('body').querySelectorAll('table')[1].querySelector('textarea')
    .rawText;

  // Our ID might not match a real piece.
  const dialIndex = infoText.indexOf('[dial]');
  if (dialIndex < 0) {
    return null;
  }

  const [metadataText, dialText] = infoText.split('[dial]');

  const name = parseName(metadataText);
  const range = parseRange(metadataText);
  const pointValue = parsePointValue(metadataText);
  const dial = parseDial(dialText);

  return {
    name,
    range,
    pointValue,
    dial,
  };
}

async function parseSeries(seriesCode, maxPieceId) {
  const pieceResults = [];
  let pieceIdNum = 1;

  while (pieceIdNum <= maxPieceId) {
    const pieceIdString = pieceIdNum.toString().padStart(3, 0);
    pieceResults.push(parsePieceData(seriesCode, pieceIdString));
    pieceIdNum += 1;
  }

  let seriesPieces = await Promise.all(pieceResults);
  seriesPieces = seriesPieces.filter((piece) => piece);
  console.log(JSON.stringify(seriesPieces, null, 2));
}

parseSeries('asm', 20);
