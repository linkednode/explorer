<script setup lang="ts">
import { Icon } from '@iconify/vue';
</script>

<template>
  <!-- footer -->
  <footer class="mt-8 mb-4">
    <div class="bg-base-100 rounded-xl border border-base-300/40 px-6 py-4">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <!-- Left side - Copyright -->
        <div class="flex items-center gap-2 text-sm text-base-content/70">
          <span>&copy; {{ new Date().getFullYear() }}</span>
          <span class="text-base-content/40">•</span>
          <span class="flex items-center gap-1.5">
            Made with
            <Icon icon="mdi:heart" class="text-error text-base animate-pulse" />
            by
          </span>
          <a 
            class="font-semibold text-primary hover:text-primary-focus transition-colors duration-150" 
            href="https://ping.pub" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Ping.pub
          </a>
        </div>
        
        <!-- Right side - Links -->
        <div class="flex items-center gap-4">
          <a
            class="flex items-center gap-1.5 text-sm text-base-content/60 hover:text-primary transition-colors duration-150"
            href="https://github.com/ping-pub/explorer/blob/master/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon icon="mdi:license" class="text-base" />
            <span class="hidden sm:inline">License</span>
          </a>
          <a 
            class="flex items-center gap-1.5 text-sm text-base-content/60 hover:text-primary transition-colors duration-150" 
            href="https://github.com/ping-pub/explorer" 
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon icon="mdi:github" class="text-base" />
            <span class="hidden sm:inline">GitHub</span>
          </a>
          <a 
            class="flex items-center gap-1.5 text-sm text-base-content/60 hover:text-primary transition-colors duration-150" 
            href="https://twitter.com/ping_pub" 
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon icon="mdi:twitter" class="text-base" />
            <span class="hidden sm:inline">Twitter</span>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
