// ===== URL do Backend ===== //
const API_URL = "https://sheep-adops.vercel.app/verificar";

document.getElementById("form-url-param").addEventListener("submit", async function(event) {
    event.preventDefault(); // impede a página de recarregar

    // --- URLs e Parametros --- //
    const urls = document.getElementById("txt_url").value.split("\n").filter(u => u.trim());
    const parametros = document.getElementById("txt_parameter").value.split("\n").filter(p => p.trim());

    document.querySelector("thead").className = "";
    document.getElementById("btns-container").style.display = "flex";

    // --- Cabeçalho e Botões (.apagar off) --- //
    document.querySelector("thead").className = "";
    document.getElementById("btns-container").style.display = "flex";

    // --- Loading da Tabela --- //
    const tabelinha = document.querySelector("#results_body");
    tabelinha.innerHTML = `
        <tr>
            <td colspan="4" style="text-align:center; padding:20px;">
                <div class="spinner"></div>
                <div>Processando...</div>
            </td>
        </tr>
    `;

    try {
        // --- Requisição - backend --- //
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ urls, parametros })
        });

        // --- Erro de Response --- //
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        // --- recebe JSON --- //
        const data = await response.json();
        const resultados = Array.isArray(data.resultados) ? data.resultados : [];

        if (resultados.length === 0) {
            tabelinha.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center;">
                        Nenhum resultado encontrado.
                    </td>
                </tr>
            `;
        } else {
            // --- Tabelinha --- //
            tabelinha.innerHTML = resultados.map(r => {
                const paramsHTML = r.params.map(p => `<li><b>${p.param}:</b> ${p.valor}</li>`).join("");
                return `
                    <tr class="linha-resultado">
                        <td class="position">${r.position}</td>
                        <td class="urls"><a href="${r.url}" target="_blank">${r.url}</a></td>
                        <td class="params"><ul>${paramsHTML}</ul></td>
                        <td class="status">${r.status}</td>
                    </tr>
                `;
            }).join("");
        }

        // move a tela para tabela
        const tabela = document.querySelector("table");
        tabela.scrollIntoView({ behavior: "smooth", block: "start" });

    } catch (error) {
        tabelinha.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; color:red;">
                    Ocorreu um erro: ${error.message}
                </td>
            </tr>
        `;
    }
});

// ===== Botôes - UP/DOWN ===== //
const tabela = document.querySelector("table");

document.getElementById("btn_up").addEventListener("click", () => {
    tabela.scrollIntoView({ behavior: "smooth", block: "start" });
})
document.getElementById("btn_down").addEventListener("click", () => {
    tabela.scrollIntoView({ behavior: "smooth", block: "end" });
})

