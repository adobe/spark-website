/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global window fetch document */
/* eslint-disable import/named, import/extensions */

import {
    createTag,
  } from '../../scripts/scripts.js';

function embedYoutube(url){
    const usp=new URLSearchParams(url.search);
    const vid=usp.get('v');
    const embed = url.pathname;
    const embedHTML=`<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&amp;v=${vid}`: embed} style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen="" scrolling="no" allow="encrypted-media; accelerometer; gyroscope; picture-in-picture" title="content from youtube" loading="lazy"></iframe>
      </div>
    `;
    const type = 'youtube';
    return {embedHTML, type}; 
}

function embedInstagram(url){
    const location = window.location.href;
    const embedHTML=`
      <div style="width: 100%; position: relative; padding-bottom: 56.25%; display: flex; justify-content: center">
      <iframe class="instagram-media instagram-media-rendered" id="instagram-embed-0" src="${url.href}/embed/?cr=1&amp;v=13&amp;wp=1316&amp;rd=${location.endsWith('.html') ? location : location + '.html'}"
      allowtransparency="true" allowfullscreen="true" frameborder="0" height="530" style="background: white; border-radius: 3px; border: 1px solid rgb(219, 219, 219);
      box-shadow: none; display: block;">
      </iframe>
      </div>`;
    const type='instagram';
    return {embedHTML, type};
}

function embedVimeo(url){
    const linkArr = url.href.split('/');
    const video = linkArr ? linkArr[3] : linkArr;
    const embedHTML=`
        <div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
        <iframe src="${vimeoPlayerFlag ? url.href : `https://player.vimeo.com/video/${video}`}?byline=0&badge=0&portrait=0&title=0" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
        allowfullscreen="" scrolling="no" allow="encrypted-media" title="content from vimeo" loading="lazy">
        </iframe>
        </div>`
    const type='vimeo-player';
    return {embedHTML, type};
}

function embedAdobeTv(url){
    const embedHTML=`
    <div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
    <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen=""
    scrolling="no" allow="encrypted-media" title="content from adobe" loading="lazy">
    </iframe>
    </div>`
    const type='adobe-tv';
    return {embedHTML, type};
}

const functObj = {
    "www.youtube.com": embedYoutube,
    "video.tv.adobe.com": embedAdobeTv,
    "www.instagram.com": embedInstagram,
    "www.vimeo.com": embedVimeo, 
    "player.vimeo.com": embedVimeo,
};

function decorateBlockEmbeds($block){
    const blockEmbeds = document.querySelectorAll('.embed.block a[href]').forEach(($a) => {
        const url = new URL($a.href.replace(/\/$/, ''));
        if (functObj[url.hostname]){
            if(type){
                const $embed=createTag('div', {class: `embed embed-oembed embed-${type}`});
                const $div=$a.closest('div');
                $embed.innerHTML=embedHTML;
                $div.parentElement.replaceChild($embed, $div);
            }
        }
    });
}

export default function decorate($block){
    decorateBlockEmbeds($block);
}