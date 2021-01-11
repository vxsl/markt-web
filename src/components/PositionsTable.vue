<template>
    <table id="positionsData" class="table table-dark">
        <thead>
        <tr>
            <th></th>
            <th>Quantity</th>
            <th>Value</th>
            <th>Margin</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(position, ticker) in positions" :key="ticker">
            <td>{{ticker}}</td>
            <td>{{position.quantity}}</td>
            <td>{{parseFloat(stocks[ticker].price.current).toFixed(2)}}</td>
            <td>{{parseFloat(stocks[ticker].price.max).toFixed(2)}}</td>
        </tr>
        </tbody>
    </table>
</template>

<script>
export default {
    props: {
        positions: {},
        stocks: {}
    }
}
</script>