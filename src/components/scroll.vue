<template>
  <div
    :style="outerListContainerStyle"
    :class="[
      'component-long-list-scroll',
      isPc ? 'pc-scroll' : ''
    ]"
    ref="OuterListContainer"
    @scroll="(()=>throttle(handleOnScroll, 100))()"
  >
    <component
      :is="useLoadingMore ? 'LoadingMore' : 'div'"
      ref="LoadingMore"
      v-bind="{
        ...(useLoadingMore ? loadingMoreProps : {})
      }"
      :class="useLoadingMore ? 'component-loading-more' : ''"
      @loadingEvent="loadingEvent"
    >
      <ul
        :style="innerListContainerStyle"
        class="inner-list-container"
      >
        <li
          v-for="(item, idx) in renderList"
          :key="idx"
          :style="itemStyle(idx)"
          ref="ListItem"
          class="list-item"
        >
          <slot :content="item" />
        </li>
      </ul>
      <template v-if="useLoadingMore" v-slot:loadingMoreText>
        <slot name="loadingMoreText" />
      </template>
    </component>
  </div>
</template>

<script lang='ts'>
import throttle from 'lodash/throttle'
import LoadingMore from './loading.vue'
import { cssUtil } from '../utils'

const _OuterListContainer = Symbol('OuterListContainer')
const _LoadingMore = Symbol('LoadingMore')

const Refs: { [key: string]: object } = {
  [_OuterListContainer]: null,
  [_LoadingMore]: null
}

/**
 * @displayName 长列表滚动
 */
export default {
  name: 'LongListScroll',
  components: {
    LoadingMore
  },
  props: {
    /**
     * 容器宽度，默认100%
     */
    width: {
      type: Number
    },
    /**
     * 容器高度
     */
    height: {
      type: Number,
      required: true,
      default: 300
    },
    /**
     * 每个列表元素高度（暂只支持固定高）
     */
    itemHeight: {
      type: Number,
      required: true,
      default: 50
    },
    /**
     * 最大渲染元素数量
     */
    renderNum: {
      type: Number,
      default: 15
    },
    /**
     * 数据
     */
    list: {
      type: Array,
      required: true,
      default () {
        return []
      }
    },
    /**
     * 定位至该索引对应的元素
     */
    activedIndex: {
      type: Number
    },
    /**
     * 是否使用更多组件
     */
    useLoadingMore: {
      type: Boolean,
      default: false
    },
    /**
     * 加载更多组件props（useLoadingMore为true时生效）
     */
    loadingMoreProps: {
      type: Object,
      required: true,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      renderList: [],
      start: 0
    }
  },
  computed: {
    isPc () {
      return !(navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))
    },
    outerListContainerStyle () {
      const { width, height } = this
      return {
        width: width ? cssUtil.toRem(width) : '100%',
        height: cssUtil.toRem(height)
      }
    },
    innerListContainerStyle () {
      const { list, itemHeight } = this
      return {
        height: cssUtil.toRem(list.length * itemHeight)
      }
    }
  },
  watch: {
    start: {
      handler (val) {
        this.getRenderList(val)
      },
      immediate: true
    },
    list (val) {
      const { start, renderNum } = this
      const _start = val.lenght - start - 1 > renderNum
        ? start
        : val.lenght - renderNum - 1 > 0
          ? val.lenght - renderNum - 1
          : 0
      this.getRenderList(_start)
    },
    activedIndex: {
      handler (val) {
        if (typeof val === 'number' && (this.list.length - 1) > val) {
          this.$nextTick(() => {
            const [ref] = this.$refs?.ListItem ?? []
            ref && ref.scrollIntoView({
              behavior: 'instant',
              block: 'center',
              inline: 'nearest'
            })
          })

          this.setStart(val)
        }
      },
      immediate: true
    }
  },
  mounted () {
    const OuterListContainer = this.$refs.OuterListContainer
    ;(Refs as any)[_OuterListContainer] = OuterListContainer

    if (this.useLoadingMore) {
      setTimeout(() => {
        (Refs as any)[_LoadingMore] = this.$refs.LoadingMore

        ;(Refs as any)[_LoadingMore].dom = OuterListContainer
      })
    }
  },
  methods: {
    throttle,
    handleOnScroll (e: Event) {
      const { scrollTop, offsetHeight } = e.target as any
      const { start, itemHeight, renderNum, useLoadingMore } = this
      if (
        start * itemHeight - scrollTop > itemHeight ||
        (start + renderNum) * itemHeight - scrollTop - offsetHeight < 0
      ) {
        const idx = Math.round(scrollTop / itemHeight)
        this.start = idx - 5 > 0 ? idx - 5 : 0
      }

      if (useLoadingMore) {
        (Refs as any)[_LoadingMore] && (Refs as any)[_LoadingMore].scrollEvent(e)
      }
    },
    itemStyle (idx: number) {
      const { itemHeight } = this
      return {
        top: cssUtil.toRem(itemHeight * (this.start + idx))
      }
    },
    getRenderList () {
      this.renderList = this.list.slice(this.start, this.start + this.renderNum)
    },
    setStart (start: number) {
      this.start = start
    },
    loadingEvent () {
      /**
       * 加载更多
       *
       * @event loadingEvent
       */
      this.$emit('loadingEvent')
    }
  }
}
</script>

<style lang='less' scoped>
.component-long-list-scroll {
  overflow-y: auto;
  box-sizing: border-box;
  position: relative;
  &.pc-scroll {
    &::-webkit-scrollbar-button {
      display: none;
    }
    &::-webkit-scrollbar {
      width: 5px;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(107, 102, 102, 0.35);
      border-radius: 5px;
    }
    &.hide-scroll-bar::-webkit-scrollbar {
      display: none;
    }
    &.hide-scroll-bar {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
  }
  .inner-list-container {
    position: relative;
    width: 100%;
  }
  .list-item {
    width: 100%;
    position: absolute;
    display: block;
    box-sizing: border-box;
  }
  .component-loading-more {
    height: auto;
  }
}
</style>
