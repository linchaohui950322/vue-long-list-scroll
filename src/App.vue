<template>
  <div id="app">
    <Scroll
      :list="list"
      :activedIndex="activedIndex"
      @loadingEvent="loadingEvent"
    >
      <template v-slot="message">
        <div style="height: 50px;color: #000;">{{ message.content }}</div>
      </template>
      <template v-slot:loadingMoreText>
        <div style="background-color: red;">加载更多</div>
      </template>
    </Scroll>
  </div>
</template>

<script>
import Scroll from './components/scroll.vue'

const list = []
for (let i = 0; i < 1000; i++) {
  list.push(i + 1)
}

export default {
  name: 'App',
  components: {
    Scroll
  },
  data () {
    return {
      list,
      activedIndex: 100,
      loadingEvent () {
        const cache = []
        let i = 0
        while (i++ < 10) {
          cache.push(list.length + i + 1)
        }
        list.push(...cache)
      }
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  font-size: 37.5px;
}
</style>
