// ===== URL do Backend ===== //
const API_URL = "http://127.0.0.1:8000/verificar"
// window.location.hostname.includes("localhost")
//     ? "https://127.0.0.1:8000/verificar" // caso seja local
//     : "https://COLOCAR-MEU-LINK-AQUI.vercel.app/verificar";

document.getElementById("form-url-param").addEventListener("submit", async function(event) {
    event.preventDefault(); // impede a página de recarregar

    const formData = new FormData(this);
    const tabelinha = document.getElementById("results_body");

    tabelinha.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px;">Processando...</td></tr>`;

    try {
        const response = await fetch(API_URL, { method: "POST", body: formData });
        const data = await response.json();
        tabelinha.innerHTML = "";

        if (!data.resultados.length) {
            tabelinha.innerHTML = `<tr><td colspan="4" style="text-align:center;">Nenhum resultado</td></tr>`;
        } else {
            data.resultados.forEach(r => {
                const paramsHTML = r.params.map(p => `<li><b>${p.param}:</b> ${p.valor}</li>`).join("");
                tabelinha.innerHTML += `
                    <tr>
                        <td>${r.position}</td>
                        <td><a href="${r.url}" target="_blank">${r.url}</a></td>
                        <td><ul>${paramsHTML}</ul></td>
                        <td>${r.status}</td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        tabelinha.innerHTML = `<tr><td colspan="4" style="color:red;">Ocorreu um erro: ${err}</td></tr>`;
    }
});

