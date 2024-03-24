
function init() {
    const puppeteer = require('puppeteer');
    console.log("La página se ha cargado.");
    // Aquí puedes colocar tu código que deseas ejecutar al cargar la página

    // URL de la página a monitorear
const url = 'https://www.dian.gov.co/dian/ventasremates/Paginas/donaciones.aspx';

// Función para verificar cambios en la página
async function checkWebsite(url) {
    // const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    try {
        // Esperar a que la tabla esté presente en la página
        await page.waitForSelector('table[summary="Ofrecimientos-donaciones-de-mercancias-ADA"]', { timeout: 5000 });

        // Extraer datos de la tabla
        const tableData = await page.evaluate(() => {
            const table = document.querySelector('table[summary="Ofrecimientos-donaciones-de-mercancias-ADA"]');
            const rows = Array.from(table.querySelectorAll('tbody tr'));
            return rows.map(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                return cells.map(cell => cell.textContent.trim());
            });
        });

        await browser.close();

        return tableData;
    } catch (error) {
        console.error('Error al obtener la tabla:', error);
        await browser.close();
        return null;
    }
}

// Función para enviar notificación de escritorio
function sendNotification(message) {
    notifier.notify({
        title: 'Cambios detectados en la página',
        message: message,
        sound: true, // Reproducir un sonido al recibir la notificación
        wait: true // Esperar hasta que el usuario cierre la notificación
    });
}

// Función principal
async function main() {
    console.log('Monitoreando cambios en la página...');
    // document.write('Monitoreando Cambios en la página...');
    let currentData = await checkWebsite(url);

    setInterval(async () => {
        const newData = await checkWebsite(url);
        if (!arraysEqual(newData, currentData)) {
            sendNotification('Se detectaron cambios en la tabla');
            currentData = newData;
        }
    }, 60000); // Verificar cambios cada 60 segundos
}
// Función para comparar dos arrays
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i].join(',') !== arr2[i].join(',')) return false;
    }
    return true;
}

// Iniciar el monitoreo
main().catch(console.error);
}

// Llama a la función de inicialización cuando se cargue la página
window.onload = init;
