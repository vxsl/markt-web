<template>
    <div>
        <span class="lead">{{}}</span>
    </div>
</template>

<script>
export default {
    props: {
        positions: {},
        stocks: {}
    }
}
</script>

<style lang="scss">
#positionsData {
    border-radius:1em;
    td {
        border:none !important;
    }
}
</style>