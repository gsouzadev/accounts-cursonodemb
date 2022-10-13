// Modulos externos
import inquirer from 'inquirer';
import chalk from 'chalk';
// Modulos internos
import * as fs from 'fs';

operacao();

// Função inical do sistema
function operacao() {
    // Configurações do Prompt
    inquirer.prompt([{
        type: 'list',
        name: 'acao-inicial',
        message : "O que você deseja fazer?",
        choices: [
            'Criar Conta',
            'Consultar Saldo',
            'Depositar',
            'Sacar',
            'Sair'
        ]
    }]).then((escolha) => {
        // Recupera a escolha feita pelo usuário
        const acao = escolha['acao-inicial'];

        // Designa para o metodo do qual o usuário escolheu
        if(acao === 'Criar Conta') {
            criarConta();
        } else if (acao === 'Consultar Saldo') {
            consultarSaldo();
        } else if (acao === 'Depositar') {
            depositar();
        } else if (acao === 'Sacar') {
            sacar();
        } else {
            console.log(chalk.bgYellow.black("\nMuito obrigado por usar nosso banco!\n"));
            process.exit();
        }
    })
    .catch((err) => console.log(err))
}

// Criar Conta
function criarConta() {
    // Exibe as mensagens da escolha feita
    console.log(chalk.bgGreen.black("\nEstamos felizes por escolher o nosso banco!"))
    console.log(chalk.green("Defina as opções da sua conta a seguir:\n"));
    salvarConta();
}

// Salva a conta no banco de dados
function salvarConta() {
    // Instancia mais um prompt para recuperar os detalhes da conta
    inquirer.prompt([{
        name: "nome-conta",
        message: "Digite um nome para sua conta:"
    }]).then((resposta) => {
        // Recupera o nome escolhido da conta do usuário
        const nomeConta = resposta['nome-conta'].trim();

        /**
         * ! Verifica se o diretorio "./contas" não existe e se não existir 
         * ! cria o diretorio por sí só dinamicamente
         */
        if(!fs.existsSync('contas')) {
            /**
             * * Cria o diretório em caso de inexistencia
             */
            fs.mkdirSync('contas');
        }

        /**
         * ! Verifica se a conta que o usuário escolheu dentro do 
         * ! diretório "./contas" já existe
         */
        if(nomeConta === '') {
            console.log(chalk.bgRed.black(`\nDigite um nome válido para a sua conta!\n`));
            salvarConta();
        } else {
            if(fs.existsSync(`contas/${nomeConta}.json`)) {
                console.log(chalk.bgRed.black(`\nEssa conta já existe! Por favor escolha outro nome.\n`))
                salvarConta();
            } else {
                /**
                 * * Cria o json da conta do usuário dinamicamente
                 */
                fs.writeFileSync(`contas/${nomeConta}.json`, `{"balance": 0}`, (err) => {
                    operacao();
                })
                console.log(chalk.bgGreen.black(`\nSua conta foi criada com sucesso!\n`));
            }
        }
    }).catch((err) => console.log(err))
}

function depositar() {
    inquirer.prompt([{
        name: "nome-conta",
        message: "Qual o nome da sua conta:"
    }]).then((resposta) => {
        const nomeConta = resposta['nome-conta'];

        if(!checarConta(nomeConta)) {
            return depositar();
        }

        inquirer.prompt([{
            name: "valor-deposito",
            message : "Quanto você deseja depositar:"
        }]).then((resposta) => {
            const valorDeposito = resposta['valor-deposito'];

            adicionarSaldo(nomeConta, valorDeposito);

        }).catch((err) => console.log(err));
    }).catch((err) => console.log(err))
}

function checarConta(nomeConta) {
    if(!fs.existsSync(`contas/${nomeConta}.json`)) {
        console.log(
            chalk.bgRed.black("\nEsta conta não existe, escolha outra com nome existente!\n")
        )
        return false;
    }

    return true;
}

function recuperarConta(nomeConta) {
    const contaJSON = fs.readFileSync(`contas/${nomeConta}.json`, {
        encoding: 'utf-8',
        flag: 'r'
    });

    return JSON.parse(contaJSON);
}

function adicionarSaldo(nomeConta, deposito) {
    const contaDados = recuperarConta(nomeConta);

    if(!deposito) {
        console.log(chalk.bgRed.black("\nOcorreu algum erro, tente novamente mais tarde!\n"))
        return depositar();
    }

    contaDados.balance = parseFloat(contaDados.balance) + parseFloat(deposito)

    fs.writeFileSync(`contas/${nomeConta}.json`,
    JSON.stringify(contaDados),
    (err) => console.log(err));

}

function consultarSaldo() {
    inquirer.prompt([{
        name: "nome-conta",
        message: "Qual o nome da sua conta:"
    }]).then((resposta) => {
        const nomeConta = resposta['nome-conta']

        if(!checarConta(nomeConta)) {
            return consultarSaldo();
        }

        const contaData = recuperarConta(nomeConta);
        
        console.log(chalk.bgBlue.black(`\nOlá, você possui R$${contaData.balance} em sua conta!\n`));
        operacao();
    }).catch((err) => console.log(err))
}

function sacar() {
    inquirer.prompt([{
        name: 'nome-conta',
        message: "Qual o nome da sua conta:"
    }]).then((resposta) => {
        const nomeConta = resposta['nome-conta'];

        if(!checarConta(nomeConta)) {
            sacar();
        } else {
            inquirer.prompt([{
                name: 'valor-saque',
                message: "Quanto você deseja sacar?"
            }]).then((resposta) => {
                const valorSaque = resposta['valor-saque'];
                sacarDinheiro(nomeConta, valorSaque);
            }).catch((err) => console.log(err))
        }
    }).catch((err) => console.log(err))
}

function sacarDinheiro(nomeConta, saque) {
    const contaData = recuperarConta(nomeConta);

    if(!saque) {
        console.log(chalk.bgRed.black("\nOcorreu algum erro, tente novamente mais tarde!\n"));
        return sacar();
    }

    if(contaData.balance < saque) {
        console.log(chalk.bgRed.black("\nOoops! Você não possuí o valor do saque, tente novamente!\n"));
        return sacar();
    } 

    contaData.balance = parseFloat(contaData.balance) - parseFloat(saque);

    fs.writeFileSync(`contas/${nomeConta}.json`,
    contaData.stringify(),
    (err) => console.log(err));

    console.log(chalk.bgBlue.black(`Você sacou R$${saque} da sua conta!`));

    operacao();
}