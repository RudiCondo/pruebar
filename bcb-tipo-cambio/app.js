const btnConsultar = document.getElementById('consultar');
const resultadoDiv = document.getElementById('resultado');

btnConsultar.addEventListener('click', async () => {
    const codigo = document.getElementById('moneda').value;
    resultadoDiv.textContent = 'Consultando...';

    try {
        const response = await fetch(`http://localhost:3000/indicador/${codigo}`);
        const data = await response.json();

        if(data.valor) {
            resultadoDiv.textContent = `Valor actual: ${data.valor} Bs (fecha: ${data.fecha})`;
        } else {
            resultadoDiv.textContent = 'No se pudo obtener el valor.';
        }
    } catch (error) {
        resultadoDiv.textContent = 'Error al consultar el BCB.';
        console.error(error);
    }
});
