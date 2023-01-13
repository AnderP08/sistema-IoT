var table;
var doughnutChart;
var LineChart;
var mediaChart;
var medianaChart;
var tiempoActualizacion = 10000;
var alertShown = false;

labels = ['Temperatura', 'Humedad de aire', 'Humedad de tierra'];
backgroundColor = ['rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(255, 99, 132)'];

$(document).ready(function () {
    getApi();
    setInterval(getApi, tiempoActualizacion);
});

table = $('#table').DataTable({
    order: [[0, 'asc']],
    language: {
        "emptyTable": "No hay registros aún",
        "info": "Mostrando _START_ a _END_ de _TOTAL_ registros",
        "infoEmpty": "Mostrando 0 a 0 de 0 áreas",
        "infoFiltered": "(filtrado de _MAX_ registros totales)",
        "infoPostFix": "",
        "thousands": ",",
        "lengthMenu": "Mostrar _MENU_ registros",
        "loadingRecords": "Cargando...",
        "processing": "Procesando...",
        "search": "Buscar:",
        "zeroRecords": "No se encontraron registros coincidentes",
        "paginate": {
            "first": "Primero",
            "last": "Último",
            "next": "Siguiente",
            "previous": "Atrás"
        },
    },
    columns: [
        {
            data: "entry_id",
            render: function (data) {
                return 'R-' + data.toString().padStart(8, '0');
            }
        },
        {
            data: "field1",
            render: function (data) {
                return spamBadge(data, 30, 25)
            }
        },
        {
            data: "field2",
            render: function (data) {
                return spamBadge(data, 90, 70)
            }
        },
        {
            data: "field3",
            render: function (data) {
                return spamBadge(data, 70, 60)
            }
        },
        {
            data: "created_at",
            render: function (data) {
                return formatearFecha(data);
            }
        },
    ]
});

function getApi() {
    const url = 'https://api.thingspeak.com/channels/1999874/feeds.json';
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log("🚀 ~ file: script.js:73 ~ getApi ~ data", data.feeds)
            table.clear();
            table.rows.add(data.feeds);
            table.draw();

            doughnut(data.feeds);
            line(data.feeds);
            media(data.feeds);
            mediana(data.feeds);
        });
}

function doughnut(data) {
    sumaTemperatura = data.filter(dato => !isNaN(dato.field1) && dato.field1 != null && dato.field1 != 0).length;
    sumaHumedadAire = data.filter(dato => !isNaN(dato.field2) && dato.field2 != null && dato.field2 != 0).length;
    sumaHumedad = data.filter(dato => !isNaN(dato.field3) && dato.field3 != null && dato.field3 != 0).length;
    if (typeof doughnutChart === 'undefined') {
        var ctx = $('#donu');
        doughnutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: [sumaTemperatura, sumaHumedadAire, sumaHumedad],
                    backgroundColor: backgroundColor,
                }],
            },
            options: { maintainAspectRatio: false, },
        });
    } else { updateChart(doughnutChart, null, [sumaTemperatura, sumaHumedadAire, sumaHumedad], null, null); }
}

function line(data) {
    var cant = -15;
    const getValidData = (data, field) => data.slice(cant).map(dato => !isNaN(dato[field]) && dato[field] !== null ? dato[field] : 0);

    temperatura = getValidData(data, 'field1');
    humedad = getValidData(data, 'field2');
    humedadTierra = getValidData(data, 'field3');
    fecha = data.slice(cant).map(function (dato) { return formatearFecha(dato.created_at); });

    if (typeof LineChart === 'undefined') {
        var ctx = $('#myChart3');
        LineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: fecha,
                datasets: [{
                    label: 'Temperatura',
                    data: temperatura,
                    backgroundColor: 'rgb(75, 192, 192)',
                    borderColor: 'rgb(75, 192, 192)',
                }, {
                    label: 'Humedad de aire',
                    data: humedad,
                    backgroundColor: 'rgb(54, 162, 235)',
                    borderColor: 'rgb(54, 162, 235)',
                }, {
                    label: 'Humedad de tierra',
                    data: humedadTierra,
                    backgroundColor: 'rgb(255, 99, 132)',
                    borderColor: 'rgb(255, 99, 132)',
                }],
            },
            options: { maintainAspectRatio: false, },
        });
    } else { updateChart(LineChart, fecha, temperatura, humedad, humedadTierra); }
}

function media(data) {
    let result = data.reduce((acc, curr) => {
        if (!isNaN(curr.field1)) { acc.temperatura += Number(curr.field1); acc.contTemp++; }
        if (!isNaN(curr.field2)) { acc.humedadAire += Number(curr.field2); acc.contHumedadAire++; }
        if (!isNaN(curr.field3)) { acc.humedadTierra += Number(curr.field3); acc.contHumedadTierra++; }
        return acc;
    }, { temperatura: 0, humedadAire: 0, humedadTierra: 0, contTemp: 0, contHumedadAire: 0, contHumedadTierra: 0 });
    let mediaTemp = (result.temperatura / result.contTemp).toFixed(2);
    let mediaHA = (result.humedadAire / result.contHumedadAire).toFixed(2);
    let mediaHT = (result.humedadTierra / result.contHumedadTierra).toFixed(2);
    if (typeof mediaChart === 'undefined') {
        var ctx = $('#donuPromedio');
        mediaChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: [mediaTemp, mediaHA, mediaHT],
                    backgroundColor: backgroundColor,
                }],
            },
            options: { maintainAspectRatio: false, },
        });
    } else { updateChart(mediaChart, null, [mediaTemp, mediaHA, mediaHT], null, null); }
}

function mediana(data) {
    let medianaTemp = arreglos(data, 'field1');
    let medianaHA = arreglos(data, 'field2');
    let medianaHT = arreglos(data, 'field3');
    if (typeof medianaChart === 'undefined') {
        var ctx = $('#donuMediana');
        medianaChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: [medianaTemp, medianaHA, medianaHT],
                    backgroundColor: backgroundColor,
                }],
            },
            options: { maintainAspectRatio: false, },
        });
    } else { updateChart(medianaChart, null, [medianaTemp, medianaHA, medianaHT], null, null); }
}

function updateChart(chart, fecha, temperatura, humedad_aire, humedad_tierra) {
    if (!alertShown) {
        toastr.success('Registros actualizados en tiempo real.', 'Actualización', { timeOut: 3000 });
        alertShown = true;
        setTimeout(() => {
            alertShown = false;
        }, 3000);
    }

    if (fecha != null) chart.data.labels = fecha;
    if (temperatura != null) chart.data.datasets[0].data = temperatura;
    if (humedad_aire != null) chart.data.datasets[1].data = humedad_aire;
    if (humedad_tierra != null) chart.data.datasets[2].data = humedad_tierra;
    chart.update();
}

function arreglos(data, type) {
    var type = type;
    arregloField = data.filter(dato => !isNaN(dato[type])).map(dato => Number(dato[type])).sort((a, b) => a - b);
    var middle = Math.floor(arregloField.length / 2);
    if (arregloField.length % 2 === 0) {
        return ((arregloField[middle - 1] + arregloField[middle]) / 2).toFixed(2);
    } else { return (arregloField[middle]).toFixed(2); }
}

function formatearFecha(fecha) {
    var fecha = new Date(fecha);
    var dia = fecha.toLocaleDateString('es-ES', { day: '2-digit' });
    var mes = fecha.toLocaleDateString('es-ES', { month: '2-digit' });
    var anio = fecha.toLocaleDateString('es-ES', { year: 'numeric' });
    var hora = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return dia + '-' + mes + '-' + anio + ' ' + hora;
}

function spamBadge(value, max, min) {
    var valor = Number.parseFloat(value).toFixed(2);
    var classBadge = (valor > max) ? 'bg-danger' : ((valor >= min) ? 'bg-success' : 'bg-warning');
    return (isNaN(valor) || valor == null || valor == '' || valor == 0) ? '<span class="badge bg-secondary">- -</span>' : '<span class="badge ' + classBadge + '">' + valor + '</span>';
}
