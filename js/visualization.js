const NUM_TABLES = 6

var gainerCharts = []

var container = document.querySelector('.chartTable');

for (let i = 0; i < NUM_TABLES; i++) {
    var div = document.createElement('div');
    div.classList.add('chart-container');

    var canvas = document.createElement('canvas');
    div.appendChild(canvas);
    container.appendChild(div);

    var ctx = canvas.getContext('2d');
    //var config = createConfig(details.mode, details.intersect);
    new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [{
                label: 'My First dataset',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: [0, 10, 5, 2, 20, 30, 45]
            }]
        },

        // Configuration options go here
        options: {}
    }); 
};