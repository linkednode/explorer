<script lang="ts" setup>
import { fromBech32, fromHex, toBech32 } from '@cosmjs/encoding';

let x = toBech32('neutronvaloper1', fromHex('3363E8F97B02ECC00289E72173D827543047ACDA'));
let add = fromBech32('cosmosvaloper1jxv0u20scum4trha72c7ltfgfqef6nsch7q6cu');
let op = toBech32('neutronvaloper1', add.data);
console.log(x);
console.log(op);
</script>
<template>
  <div class="bg-base-100 shadow-md rounded-box p-4 mb-4 text-base-content">
    <div>address:</div>
  </div>
</template>
