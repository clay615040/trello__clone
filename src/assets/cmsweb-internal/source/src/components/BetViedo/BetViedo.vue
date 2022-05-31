<template lang="pug">
  div(v-if="videoUrl && gameType === 'audere'")
    video-player.video-player-box.vjs-custom-skin.video-audere(:options="optPlayer" :playsinline="true")
  div(v-else-if="videoUrl && gameType === 'chess'")
    iframe.video-chess(:src="videoUrl" :key="new Date().getTime()")
</template>

<script>
import { videoPlayer } from 'vue-video-player'
import 'videojs-contrib-hls/dist/videojs-contrib-hls'
import 'video.js/dist/video-js.css'
import 'vue-video-player/src/custom-theme.css'

export default {
  name: 'BetViedo',

  components: { 
    'video-player': videoPlayer,
  },

  props: {
    gameType: {
      type: String,  
      default: '',
    },
    videoUrl: {
      type: String,  
      default: '',
    },
  },

  data() {
    return {
      optPlayer: {
        muted: true,
        language: 'en',
        hls: true,
        playbackRates: [0.7, 1.0, 1.5, 2.0],
        sources: [{
          type: 'application/x-mpegURL',
          src: this.videoUrl
        }],
      },
    }
  },

  computed: {
    videoPlayerOptions() {
      const optPlayer = {
        muted: true,
        language: 'en',
        hls: true,
        playbackRates: [0.7, 1.0, 1.5, 2.0],
        sources: [{
          type: 'application/x-mpegURL',
          src: this.videoUrl
        }],
      }
      return optPlayer
    }
  },
}
</script>

<style lang="scss">
  .video-audere {
    margin: 0 auto;
    width: 100%;
    background-color: white;
    aspect-ratio: 16 / 9;
    
    .video-js {
      width: 100%;
      height: 100%;
    }
  }

  .video-chess {
    margin: 4px auto;
    display: block;
    border: none;
    width: 100%;
    aspect-ratio: 16 / 9;
  }
</style>