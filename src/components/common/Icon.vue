<script setup lang="ts">
// Values are raw inner-SVG markup (not just a single path's `d`) so icons
// that need more than one shape (rects, circles, polylines) can be
// expressed exactly as they appear in the source design, pixel-for-pixel.
const ICON_MARKUP: Record<string, string> = {
  fire: '<path d="M12 2c1 3-2 4-2 7a4 4 0 0 0 8 0c0-1-.5-2-1-2 .5 2-1 3-2 3-2 0-2-2-1-4 .5-1 .5-2 0-4-2 1-4 3-4 6a6 6 0 0 0 12 0c0-5-4-6-4-6"/>',
  calendar: '<path d="M3 9h18M8 3v4M16 3v4M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/>',
  cart: '<path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L21 8H6M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>',
  vocab: '<path d="M4 19V6a2 2 0 0 1 2-2h13M4 19a2 2 0 0 0 2 2h13V4M9 8h5M9 12h5"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z"/>',
  chat: '<path d="M21 11.5a8.4 8.4 0 0 1-1.9 5.4 8.5 8.5 0 0 1-7.6 3 8.4 8.4 0 0 1-3-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3A8.5 8.5 0 0 1 7 4.7a8.4 8.4 0 0 1 5.4-1.9c2.2 0 4.4.9 6 2.5a8.4 8.4 0 0 1 2.6 6.2Z"/>',
  gym: '<path d="M6.5 6.5v11M17.5 6.5v11M2 9.5v5M22 9.5v5M6.5 12h11"/>',
  goal: '<path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-3a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9Z M13.7 21a2 2 0 0 1-3.4 0"/>',
  toeic: '<path d="M5 3v18M5 3h11l-2.5 4L16 11H5"/>',
  portfolio:
    '<path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Zm4-2V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1M4 12h16"/>',
  sport:
    '<path d="M13.5 4.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM6 20l3-6 2-2-1-4-3 1M9 12l3 1 2 5M9 8l3-2 3 2 3-1"/>',
  frontend: '<path d="M8 9l-4 3 4 3M16 9l4 3-4 3M13 6l-2 12"/>',
  camera:
    '<path d="M4 8a2 2 0 0 1 2-2h1.5l1-1.5h7l1 1.5H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z M12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/>',
  threads:
    '<path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm2.2 12.6c-.6.5-1.4.8-2.4.8-2 0-3.4-1.4-3.4-3.2 0-1.9 1.4-3.5 3.6-3.5 1 0 1.7.3 2.2.8m-4-1.4c.3-1.3 1.3-2.1 2.7-2.1"/>',
  facebook: '<path d="M15 4h-2a4 4 0 0 0-4 4v3H7v3h2v6h3v-6h2.5l.5-3H12V8a1 1 0 0 1 1-1h2V4Z"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2M5.5 5h13l3.5 7v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7Z"/>',
  plusCircle: '<path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v8m-4-4h8"/>',
  edit: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>',
  checkCircle: '<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1M22 4 12 14.01l-3-3"/>',
  award: '<path d="M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm-4.2-.6L7 22l5-2.5L17 22l-.8-7.6"/>',
  chart: '<path d="M3 3v18h18M7 16l4-6 3 3 5-8"/>',
  trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-2.64-6.36M21 4v5h-5"/>',
  gear: '<path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0 M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',

  // Sidebar nav icons (exact paths from the design source)
  navGrid:
    '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  navBolt: '<polyline points="13 2 3 14 11 14 9 22 21 10 13 10 13 2"/>',
  navBook: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  navFolder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>',
  navPerson: '<circle cx="13" cy="4" r="2"/><path d="M4 22l4-9 3 3v6"/><path d="M19 22l-3-8-5-3 1-5"/><path d="M9 10l3-3 3 2 3-1"/>',
  navLink:
    '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  navChat:
    '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  navHelp: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  navLogout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  chevronsLeft: '<polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/>',
}

withDefaults(defineProps<{ name: string; size?: number }>(), { size: 16 })
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="shrink-0"
    v-html="ICON_MARKUP[name] || ''"
  />
</template>
