'use strict';
var React = require('react');
var Photo = require('./photo');
var notFound = require('./notFound.png');
var debounce = require('debounce');
let showChamps = null;

function getCounters(champion) {
  const url = `http://www.championcounter.com/${champion}`;
  return fetch(url).then(resp => resp.text()).then(htmlText => {
    var el = document.createElement( 'html' );
    el.innerHTML = htmlText;
    let panel = el.querySelector('#weakAgainst');
    let list = panel.querySelectorAll('a');
    let result = [];
    for (let i = 0; i < list.length; i++) {
      let champ = list[i];
      if (!champ || !champ.children) {
        continue;
      }
      let htmlParts = champ.children;
      if (htmlParts[0] && htmlParts[0].tagName === 'H4' &&
          htmlParts[1] && htmlParts[1].tagName === 'IMG') {
        let title = htmlParts[0].innerHTML;
        let image = htmlParts[1].src;
        result.push({
          title,
          getPreview: () => <Photo src={image} />
        });
      }
    };
    return result;
  }).catch(err => {
     showChamps({
      icon: notFound,
      title: 'Not found'
    });
  });
}

function createPhoto(champ, src) {
   return (<div key={champ}>
      <img src={src} />
    </div>)
}

function getBuilds(champion) {

}


function lolStrategy(term) {
  let commands = term.split(' ');
  if (commands.length === 3) {
    let searchType = commands[1];
    let champion = commands[2];

    if(searchType === 'counter' && champion !== '') {
      getCounterByChamp(champion)
    }
  }
}

function counterStrategy(term) {
  let commands = term.split(' ');
  if (commands.length === 2) {
    let champion = commands[1];

    if(champion !== '') {
      getCounterByChamp(champion)
    }
  }
}

function getCounterByChamp(champion) {
  getCounters(champion).then(counters => {
    showChamps(counters);
  })
}

const plugin = debounce(({term, display, actions}) => {
  showChamps = display;
  let match = term.match(/^(lol|counter)\s+(.+)/i); // lol [build |counter] champion
  if (match) {
    let commands = term.split(' ');
    switch (commands[0]) {
      case 'counter':
        return counterStrategy(term);
      default:
        return lolStrategy(term);
    }
  }
}, 500);

module.exports = {
  fn: plugin,
  name: 'League of legends helper',
  keyword: 'lol counter|build champion',
}
