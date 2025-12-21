const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const xml2js = require('xml2js');

const app = express();
app.use(bodyParser.text({ type: 'text/xml' }));

const SOAP_URL = "https://indicadores.bcb.gob.bo:443/ServiciosBCB/indicadores";

app.get('/indicador/:codigo', async (req, res) => {
    const codigoIndicador = req.params.codigo;

    const soapRequest = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.bcb.gob.bo">
        <soapenv:Header/>
        <soapenv:Body>
            <ws:obtenerIndicador>
                <codigoIndicador>${codigoIndicador}</codigoIndicador>
            </ws:obtenerIndicador>
        </soapenv:Body>
    </soapenv:Envelope>`;

    try {
        const response = await fetch(SOAP_URL, {
            method: "POST",
            headers: {
                "Content-Type": "text/xml;charset=UTF-8",
                "SOAPAction": ""
            },
            body: soapRequest
        });

        const text = await response.text();

        // Parse XML a JSON
        xml2js.parseString(text, { explicitArray: false }, (err, result) => {
            if(err) return res.json({ error: 'Error parseando XML' });

            // Navegar hasta valor y fecha
            try {
                const indicador = result['soap:Envelope']['soap:Body']['ns2:obtenerIndicadorResponse']['return'];
                res.json({
                    codigo: indicador.codigo,
                    nombre: indicador.nombre,
                    fecha: indicador.fecha,
                    valor: parseFloat(indicador.valor)
                });
            } catch (error) {
                res.json({ error: 'Estructura inesperada del XML' });
            }
        });
    } catch (error) {
        res.json({ error: 'Error al conectarse con BCB' });
    }
});

app.listen(3000, () => {
    console.log('Proxy SOAP BCB corriendo en http://localhost:3000');
});
