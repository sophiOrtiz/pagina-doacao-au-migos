const express = require('express');
const cors = require('cors'); 
const bodyParser = require('body-parser'); 

const app = express();
const PORT = 3000;


app.use(cors());

app.use(bodyParser.json()); 
app.get('/', (req, res) => {
    console.log('Requisição GET recebida na raiz.');
    res.status(200).send({ message: 'Servidor Au-migos online e pronto para receber doações!' });
});


app.post('/doar', (req, res) => {
    const dadosDoacao = req.body;
    
    console.log('--- NOVA DOAÇÃO RECEBIDA ---');
    console.log(`Nome: ${dadosDoacao.nome}`);
    console.log(`E-mail: ${dadosDoacao.email}`);
    console.log(`Valor: R$ ${dadosDoacao.valor}`);
    console.log(`Método: ${dadosDoacao.pagamento}`);
    console.log(`Mensagem: ${dadosDoacao.mensagem || 'Nenhuma mensagem'}`); 

    if (!dadosDoacao.valor || parseFloat(dadosDoacao.valor) < 5) {
        
        console.log('Doação recusada: Valor inválido.');
        return res.status(400).send({ 
            success: false, 
            message: 'O valor da doação é inválido ou muito baixo.' 
        });
    }

    console.log(`Doação de R$ ${dadosDoacao.valor} processada com sucesso via ${dadosDoacao.pagamento}.`);
    
res.status(200).send({ 
    success: true, 
    message: `Doação de R$ ${dadosDoacao.valor} confirmada! Obrigado por ajudar nossos Au-migos.`,
    redirectUrl: 'feedback.html',
    nomeDoador: dadosDoacao.nome,  // <-- NOME da variável
    valorDoado: dadosDoacao.valor  // <-- NOME da variável
});
});

app.listen(PORT, () => {
    console.log('----------------------------------------------------');
    console.log(`✅ Servidor Node.js rodando em http://localhost:${PORT}`);
    console.log(`✅ API de Doação POST escutando em http://localhost:${PORT}/doar`);
    console.log('----------------------------------------------------');
});