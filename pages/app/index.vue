<template>
  <div class="content-column">
    <h2 class="header">Client Information</h2>
    <p class="dp-content-subheading">
      Lightcord v2.0.0, Running Eris {{ erisVersion }}
    </p>
    <div class="server-insights-indent">
      <div class="key-metric">
        <div class="panel">
          <header class="header">Guilds</header>
          <div class="value">
            {{ guildCount.toLocaleString() }}
          </div>
        </div>
      </div>
      <div class="key-metric">
        <div class="panel">
          <header class="header">Shards</header>
          <div class="value">
            {{ shards.length.toLocaleString() }}
          </div>
        </div>
      </div>
      <div class="key-metric">
        <div class="panel">
          <header class="header">Latency</header>
          <div class="value">
            {{
              shards
                .map((shard) => shard.ping)
                .reduce((prev, val) => prev + val, 0)
            }}
          </div>
        </div>
      </div>
    </div>
    <div class="si-header">Shard Information</div>
    <div class="table">
      <div class="header table-row-wrap">
        <div class="table-cell" style="width: 100px">Shard ID</div>
        <div class="table-cell" style="width: 100px">Status</div>
        <div class="table-cell" style="width: 100px">Guilds</div>
        <div class="table-cell" style="width: 100px">Ping</div>
      </div>
      <div
        v-for="shard in shards"
        :key="shard.id"
        class="table-row table-row-wrap"
      >
        <div class="table-cell" style="width: 100px">
          {{ shard.id }}
        </div>
        <div class="table-cell" style="width: 100px">
          {{ shard.status }}
        </div>
        <div class="table-cell" style="width: 100px">
          {{ shard.guildCount }}
        </div>
        <div class="table-cell" style="width: 100px">
          {{ shard.ping }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { VERSION } from 'eris';

export default Vue.extend({
  layout: 'app',
  name: 'AppClientInfo',
  data() {
    return {
      uptime: 0,
      erisVersion: VERSION,
      uptimeInterval: (null as unknown) as NodeJS.Timeout,
    };
  },
  computed: {
    shards() {
      // Force re-computation every second
      ((_) => {})(this.uptime);

      if (this.$discord.client)
        return Array.from(this.$discord.client.shards.values()).map(
          (shard) => ({
            id: shard.id,
            status: shard.status,
            ping: shard.latency,
            guildCount: this.$discord.client
              ? Object.values(this.$discord.client.guildShardMap).filter(
                  (n) => n === shard.id
                ).length
              : 0,
          })
        );
      else return [];
    },
    guildCount() {
      // Force re-computation every second
      ((_) => {})(this.uptime);

      return this.$discord.client ? this.$discord.client.guilds.size : -1;
    },
  },
  beforeDestroy() {
    clearInterval(this.uptimeInterval);
  },
  created() {
    this.uptimeInterval = setInterval(() => {
      this.uptime = this.$discord.client ? this.$discord.client.uptime : 0;
    }, 1000);
  },
  head: {
    title: 'Client Information',
  },
});
</script>
