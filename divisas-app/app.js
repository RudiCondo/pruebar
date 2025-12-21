// Configuración del servicio SOAP del BCB
const SOAP_URL = "https://indicadores.bcb.gob.bo:443/ServiciosBCB/indicadores";
const SOAP_ACTION = ""; // vacío según WSDL

// Indicadores a consultar: 317 = USD, 318 = EUR, 302 = UFV (ejemplo)
const indicadores = {
    USD: 317,
    EUR: 318,
    UFV: 302
};

// Función para crear petición SOAP
function crearRequestSOAP(codigoIndicador) {
    return `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.bcb.gob.bo">
            <soapenv:Header/>
            <soapenv:Body>
                <ws:obtenerIndicador>
                    <codigoIndicador>${codigoIndicador}</codigoIndicador>
                </ws:obtenerIndicador>
            </soapenv:Body>
        </soapenv:Envelope>
    `;
}

// Función para hacer fetch SOAP
async function obtenerValorSOAP(codigoIndicador) {
    const soapRequest = crearRequestSOAP(codigoIndicador);

    const response = await fetch(SOAP_URL, {
        method: "POST",
        headers: {
            "Content-Type": "text/xml;charset=UTF-8",
            "SOAPAction": SOAP_ACTION
        },
        body: soapRequest
    });

    const textResponse = await response.text();
    // Parsear XML de respuesta
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(textResponse, "text/xml");

    // Buscar valor dentro del XML según estructura del WSDL
    // Se asume: <valor>...</valor> dentro de obtenerIndicadorResponse
    const valorNode = xmlDoc.getElementsByTagName("valor")[0];
    return parseFloat(valorNode.textContent);
}

// Función para mostrar todas las monedas
async function mostrarValores() {
    const container = document.getElementById('monedas-container');
    container.innerHTML = '';

    for (const moneda in indicadores) {
        try {
            const valor = await obtenerValorSOAP(indicadores[moneda]);
            const div = document.createElement('div');
            div.classList.add('tarjeta-moneda');
            div.innerHTML = `
                <h3>${moneda}</h3>
                <div class="valor">${valor.toFixed(2)}</div>
            `;
            container.appendChild(div);
        } catch (error) {
            console.error("Error al obtener valor de " + moneda, error);
            const div = document.createElement('div');
            div.classList.add('tarjeta-moneda');
            div.innerHTML = `
                <h3>${moneda}</h3>
                <div class="valor">Error</div>
            `;
            container.appendChild(div);
        }
    }
}

// Cálculo de compra/venta con valores obtenidos en tiempo real
async function calcularOperacion(tipo) {
    const moneda = document.getElementById('moneda').value;
    const monto = parseFloat(document.getElementById('monto').value);
    const resultadoDiv = document.getElementById('resultado');

    if (isNaN(monto) || monto <= 0) {
        resultadoDiv.textContent = 'Ingrese un monto válido.';
        return;
    }

    try {
        const valor = await obtenerValorSOAP(indicadores[moneda]);
        let resultado;
        if (tipo === 'comprar') {
            resultado = monto / valor;
            resultadoDiv.textContent = `Puedes comprar ${resultado.toFixed(2)} ${moneda}`;
        } else {
            resultado = monto * valor;
            resultadoDiv.textContent = `Al vender obtienes Bs ${resultado.toFixed(2)}`;
        }
    } catch (error) {
        resultadoDiv.textContent = "Error al obtener datos del BCB.";
        console.error(error);
    }
}

// Eventos de botones
document.getElementById('comprar').addEventListener('click', () => calcularOperacion('comprar'));
document.getElementById('vender').addEventListener('click', () => calcularOperacion('vender'));

// Inicialización
mostrarValores();
