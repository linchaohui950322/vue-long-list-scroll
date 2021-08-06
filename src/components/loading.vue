<template>
  <div
    ref="withLoadingMore"
    :class="{ 'with-scroll': type === 'scroll' }"
    class="with-loading-more"
  >
    <div class="with-loading-more-container">
      <slot />
    </div>
    <div
      v-if="type === 'scroll'"
      :style="loadingMoreStyle"
      class="loading-more"
    >
      <transition
        tag="div"
        name="fade"
        mode="out-in"
      >
        <slot name="loadingMoreText">
          <span>{{ text }}</span>
        </slot>
      </transition>
    </div>
    <div
      v-else
      :style="loadingMoreStyle"
      class="loading-more"
      @click="action"
    >
      <slot name="loadingMoreText">
        <span :style="{ color: fontColor }">加载更多</span>
        <svg width="12px" height="12px" viewBox="0 0 12 12" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          <g id="控件" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g id="查看更多" transform="translate(-194.000000, -11.000000)">
              <g id="编组" transform="translate(144.000000, 10.000000)">
                <g id="Group" transform="translate(56.000000, 7.000000) rotate(-270.000000) translate(-56.000000, -7.000000) translate(50.000000, 1.000000)">
                  <rect id="box" x="0" y="0" width="12" height="12" />
                  <polyline id="Path-4-Copy" :stroke="fontColor || '#FFFFFF'" stroke-linecap="round" stroke-linejoin="round" points="4 2 8 6 4 10" />
                </g>
              </g>
            </g>
          </g>
        </svg>
      </slot>
    </div>
  </div>
</template>

<style lang="less" scoped>
.with-loading-more {
  position: relative;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  &.with-scroll {
    height: inherit;
    overflow-y: auto;
    .loading-more {
      cursor: inherit;
    }
  }
}
.loading-more {
  position: relative;
  font-size: 12px;
  width: 100%;
  min-width: 100%;
  text-align: center;
  cursor: pointer;
  height: 40px;
  line-height: @height;
  background-color: #606060;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .3s ease;
  position: absolute;
  left: 0;
  right: 0;
  width: 100%;
  margin: 0 auto;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>

<script lang="ts">
import { PropType } from 'vue'
function getDefaultBackgroundByUrl (url: string | any[]) {
  if (!url || !url.length) {
    return {}
  }

  return {
    backgroundImage: `url(${url})`,
    backgroundColor: 'transparent',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    backgroundPosition: 'center'
  }
}

/**
 * 加载更多)组件
 *
 * @export
 * @class Loading
 * @extends {Vue}
 */
export default {
  name: 'loading-more',
  components: {
  },
  props: {
    type: {
      type: String as PropType<'normal'|'scroll'>,
      default: 'normal'
    },
    fontColor: {
      default: 'normal'
    },
    status: {
      type: String as PropType<'normal' | 'loading' | 'bottom'>,
      default: 'normal'
    },
    backgroundColor: {
      type: String
    },
    backgroundImageUrl: {
      type: String
    },
    loading: {
      type: Boolean
    },
  },
  data() {
    return {
      dom: null,
      timer: null,
    }
  },
  computed: {
    text() {
      const { status } = this
      const textMap = {
        normal: '查看更多',
        loading: '加载中',
        bottom: '没有数据了'
      }
      return textMap[status || 'normal']
    },
    loadingMoreStyle() {
      const { backgroundColor, backgroundImageUrl } = this
      const result = {
        backgroundColor,
        ...getDefaultBackgroundByUrl(backgroundImageUrl)
      }
      return result
    }
  },
  mounted () {
    this.dom = this.$refs.withLoadingMore as HTMLElement
    if (this.dom) {
      this.dom.addEventListener('scroll', this.scrollEvent)
    }
  },
  methods: {
    action () {
      if (this.status === 'normal' && !this.loading) {
        this.$emit('loadingEvent')
      }
    },
    scrollEvent (e: { preventDefault: () => void; stopPropagation: () => void }) {
      clearTimeout(this.timer)
      this.timer = null
      this.timer = window.setTimeout(() => {
        const scrollTop = this.dom.scrollTop
        const listHeight = this.dom.clientHeight
        const listAllHeight = this.dom.scrollHeight
        if (listAllHeight - scrollTop - listHeight <= 40) {
          this.action()
        }
      }, 30)
      e.preventDefault()
      e.stopPropagation()
    }
  },
  beforeDestroy () {
    clearTimeout(this.timer)
    this.timer = null
    if (this.dom) {
      this.dom.removeEventListener('scroll', this.scrollEvent)
    }
  },
}
</script>
