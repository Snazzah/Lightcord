<template>
  <!-- Discord using SVG masks for no reason it seems -->
  <svg viewBox="0 0 24 24" width="24" height="24" color="currentColor">
    <defs>
      <path id="home-a" d="M8 17v-6h4v6h5V9h3L10 0 0 9h3v8z" />
    </defs>
    <g fill="none" fill-rule="evenodd" transform="translate(2 3)">
      <mask id="home-b" fill="#fff">
        <use xlink:href="#home-a" />
      </mask>
      <use fill="#000" xlink:href="#home-a" />
      <g fill="currentColor" mask="url(#home-b)">
        <path d="M-2-3h24v24H-2z" />
      </g>
    </g>
  </svg>
</template>
