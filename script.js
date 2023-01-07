var table = null;
var gDonu = null;
var gLine = null;
var gMedia = null;
var gMediana = null;
var tiempoActualizacion = 30000;

$(document).ready(function () {
    getApi();
});

table = $('#table').DataTable({
    order: [[0, 'desc']],
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
        .then(response => response.json()) // Decodificar la respuesta JSON
        .then(data => {
            table.clear();
            table.rows.add(data.feeds);
            table.draw();

            doughnut(data.feeds);
            line(data.feeds);
            media(data.feeds);
            mediana(data.feeds);
        });
}
setInterval(getApi, tiempoActualizacion);
setInterval(actualizarGrafico, tiempoActualizacion);

labels = ['Temperatura', 'Humedad de aire', 'Humedad de tierra'];
backgroundColor = ['rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(255, 99, 132)'];

var sumaTemperatura = 0;
var sumaHumedadAire = 0;
var sumaHumedad = 0;
function doughnut(data) {
    sumaTemperatura = 0;
    sumaHumedadAire = 0;
    sumaHumedad = 0;
    data.forEach(function (dato) {
        if (!isNaN(dato.field1) && dato.field1 != null) sumaTemperatura += 1;
        if (!isNaN(dato.field2) && dato.field2 != null) sumaHumedadAire += 1;
        if (!isNaN(dato.field3) && dato.field3 != null) sumaHumedad += 1;
    });
    var ctx = $('#donu');
    gDonu = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: [sumaTemperatura, sumaHumedadAire, sumaHumedad],
                backgroundColor: backgroundColor,
            }],
        },
        options: {
            maintainAspectRatio: false,
        },
    });
}

var temperatura = [];
var humedad = [];
var humedadTierra = [];
var fecha = [];
function line(data) {
    var cant = -20;
    temperatura = [];
    humedad = [];
    humedadTierra = [];
    fecha = [];
    temperatura = data.slice(cant).map(function (dato) {
        return dato.field1;
    });
    humedad = data.slice(cant).map(function (dato) {
        if (isNaN(dato.field2) || dato.field2 == null) return '0';
        return dato.field2;
    });
    humedadTierra = data.slice(cant).map(function (dato) {
        if (isNaN(dato.field3) || dato.field3 == null) return '0';
        return dato.field3;
    });
    fecha = data.slice(cant).map(function (dato) {
        return formatearFecha(dato.created_at);
    });

    var ctx = $('#myChart3');
    gLine = new Chart(ctx, {
        type: 'line',
        data: {
            labels: fecha, // Crea un array con los números del 0 al 9
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
        options: {
            maintainAspectRatio: false,
        },
    });
}

var mediaTemp = 0;
var mediaHA = 0;
var mediaHT = 0;
function media(data) {
    var sumaTemperatura = 0;
    var sumaHumedadAire = 0;
    var sumaHumedadTierra = 0;
    var cont = 0;
    var cont2 = 0;
    var cont3 = 0;
    data.forEach(function (dato) {
        if (!isNaN(dato.field1)) {
            sumaTemperatura += Number(dato.field1);
            cont++;
        }
        if (!isNaN(dato.field2)) {
            sumaHumedadAire += Number(dato.field2);
            cont2++;
        }
        if (!isNaN(dato.field3)) {
            sumaHumedadTierra += Number(dato.field3);
            cont3++;
        }
    });
    mediaTemp = (sumaTemperatura / cont).toFixed(2);
    mediaHA = (sumaHumedadAire / cont2).toFixed(2);
    mediaHT = (sumaHumedadTierra / cont3).toFixed(2);
    var ctx = $('#donuPromedio');
    gMedia = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: [mediaTemp, mediaHA, mediaHT],
                backgroundColor: backgroundColor,
            }],
        },
        options: {
            maintainAspectRatio: false,
        },
    });
}

function arreglos(data, type) {
    var type = type;
    arregloField = [];
    data.forEach(function (dato) {
        if (!isNaN(dato[type])) {
            arregloField.push(Number(dato[type]));
        }
    });
    var sorted = arregloField.sort((a, b) => a - b);
    var middle = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        return ((sorted[middle - 1] + sorted[middle]) / 2).toFixed(2);
    } else {
        return (sorted[middle]).toFixed(2);
    }
}

var medianaTemp = 0;
var medianaHA = 0;
var medianaHT = 0;
function mediana(data) {
    medianaTemp = arreglos(data, 'field1');
    medianaHA = arreglos(data, 'field2');
    medianaHT = arreglos(data, 'field3');

    var ctx = $('#donuMediana');
    gMediana = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: [medianaTemp, medianaHA, medianaHT],
                backgroundColor: backgroundColor,
            }],
        },
        options: {
            maintainAspectRatio: false,
        },
    });
}

function actualizarGrafico() {
    gDonu.data.datasets[0].data = [sumaTemperatura, sumaHumedadAire, sumaHumedad];
    gDonu.update();

    gLine.data.labels = fecha;
    gLine.data.datasets[0].data = temperatura;
    gLine.data.datasets[1].data = humedad;
    gLine.data.datasets[2].data = humedadTierra;
    gLine.update();

    gMedia.data.datasets[0].data = [mediaTemp, mediaHA, mediaHT];
    gMedia.update();

    gMediana.data.datasets[0].data = [medianaTemp, medianaHA, medianaHT];
    gMediana.update();
    toastr.success('Registros actualizados en tiempo real.', 'Actualización', { timeOut: 3000 })
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
    if (isNaN(valor) || valor == null || valor == '' || valor == 0) return '<span class="badge bg-secondary">- -</span>';
    if (valor > max) return '<span class="badge bg-danger">' + valor + '</span>';
    if (valor >= min) return '<span class="badge bg-success">' + valor + '</span>';
    return '<span class="badge bg-warning">' + valor + '</span>';
}