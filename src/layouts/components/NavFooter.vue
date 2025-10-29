<template>
  <!-- footer -->
  <footer class="flex items-center h-12 mt-5 text-sm bg-base-100 text-base-content py-2 z-10 w-full rounded-box px-4">
    <div class="flex flex-1">
      &copy;&nbsp;
      {{ new Date().getFullYear() }}&nbsp; Made With&nbsp; <img src="../../assets/images/heart.svg" />&nbsp; By&nbsp;
      <a class="link link-hover text-primary" href="https://ping.pub" target="_blank" rel="noopener noreferrer"
        >Ping.pub</a
      >
    </div>
    <div class="hidden md:!block">
      <a
        class="link link-hover text-primary mr-4"
        href="https://github.com/ping-pub/explorer/blob/master/LICENSE"
        target="noopener noreferrer"
        >License</a
      >
      <a class="link link-hover text-primary" href="https://github.com/ping-pub/explorer" target="noopener noreferrer"
        >Github</a
      >
    </div>
  </footer>
</template>
