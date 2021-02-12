const truffleContract = require('truffle-contract');
const hubArtifacts = require('./build/contracts/Hub.json');
const tokenArtifacts = require('./build/contracts/Token.json');
const safeArtifacts = require('@circles/safe-contracts/build/contracts/GnosisSafe.json');
const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8545"));

const Hub = truffleContract(hubArtifacts);
const Token = truffleContract(tokenArtifacts);
const Safe = truffleContract(safeArtifacts);

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

Hub.setProvider(web3.currentProvider);
Token.setProvider(web3.currentProvider);
Safe.setProvider(web3.currentProvider);

const hubAddress = "0xa70E47D58b35dd03a1Fa5BA569410389Efe06234";

const test = async () => {
  const hub = await Hub.at(hubAddress);

  const ganacheAccounts = await web3.eth.getAccounts();
  const gasPrice = await web3.eth.getGasPrice();

  // step 1

  const accountA = web3.eth.accounts.create();
  const accountB = web3.eth.accounts.create();
  const accountC = web3.eth.accounts.create();

  console.log(`A: ${accountA.address}`);
  console.log(`B: ${accountB.address}`);
  console.log(`C: ${accountC.address}`);

  await web3.eth.sendTransaction({
    to: accountA.address,
    value: (17721975 * 2 * gasPrice),
    from: ganacheAccounts[1],
  });

  await web3.eth.sendTransaction({
    to: accountB.address,
    value: (17721975 * 3 * gasPrice),
    from: ganacheAccounts[1],
  });

  await web3.eth.sendTransaction({
    to: accountC.address,
    value: (17721975 * 3 * gasPrice),
    from: ganacheAccounts[1],
  });

  const signupTx = {
    to: hubAddress,
    data: hub.contract.methods.signup().encodeABI(),
    gas: 17721975,
  };

  const signA = await web3.eth.accounts.signTransaction(
    { ...signupTx, from: accountA.address }, accountA.privateKey);
  const signB = await web3.eth.accounts.signTransaction(
    { ...signupTx, from: accountB.address }, accountB.privateKey);
  const signC = await web3.eth.accounts.signTransaction(
    { ...signupTx, from: accountC.address }, accountC.privateKey);

  console.log('signed');

  await web3.eth.sendSignedTransaction(signA.rawTransaction);
  await web3.eth.sendSignedTransaction(signB.rawTransaction);
  await web3.eth.sendSignedTransaction(signC.rawTransaction);

  console.log('signed up');

  // end step 1

  // step 2

  const trustTxA = {
    to: hubAddress,
    data: hub.contract.methods.trust(accountB.address, 50).encodeABI(),
    gas: 17721975,
    from: accountA.address,
  };

  const trustA = await web3.eth.accounts.signTransaction(trustTxA, accountA.privateKey);
  await web3.eth.sendSignedTransaction(trustA.rawTransaction);

  const trustTxC = {
    to: hubAddress,
    data: hub.contract.methods.trust(accountB.address, 50).encodeABI(),
    gas: 17721975,
    from: accountC.address,
  };

  const trustC = await web3.eth.accounts.signTransaction(trustTxC, accountC.privateKey);
  await web3.eth.sendSignedTransaction(trustC.rawTransaction);

  console.log('trusted');

  // end step 2

  // step 3

  setTimeout(async () => {
    const transferTx = {
      to: hubAddress,
      data: hub.contract.methods.transferThrough(
        [accountB.address],
        [accountB.address],
        [accountA.address],
        ['12000000000000000000'],
      ).encodeABI(),
      gas: 17721975,
      from: accountB.address,
    };

    const transferB = await web3.eth.accounts.signTransaction(transferTx, accountB.privateKey);
    await web3.eth.sendSignedTransaction(transferB.rawTransaction);

    console.log('transfered');
  }, 2000);

  // end step 3

  // step 4

  setTimeout(async () => {
    const transferTx = {
      to: hubAddress,
      data: hub.contract.methods.transferThrough(
        [accountB.address],
        [accountA.address],
        [accountC.address],
        ['12000000000000000000'],
      ).encodeABI(),
      gas: 17721975,
      from: accountA.address,
    };

    const transferC = await web3.eth.accounts.signTransaction(transferTx, accountA.privateKey);
    await web3.eth.sendSignedTransaction(transferC.rawTransaction);

    console.log('transfered');
  }, 4000);

  // end step 4

  // step 5

  setTimeout(async () => {
    const accountD = web3.eth.accounts.create();

    console.log(`D: ${accountD.address}`);

    await web3.eth.sendTransaction({
      to: accountD.address,
      value: (17721975 * 2 * gasPrice),
      from: ganacheAccounts[1],
    });

    const signD = await web3.eth.accounts.signTransaction(
      { ...signupTx, from: accountD.address }, accountD.privateKey);
    await web3.eth.sendSignedTransaction(signD.rawTransaction);

    const trustTxD = {
      to: hubAddress,
      data: hub.contract.methods.trust(accountB.address, 50).encodeABI(),
      gas: 17721975,
      from: accountD.address,
    };

    const trustD = await web3.eth.accounts.signTransaction(trustTxD, accountD.privateKey);
    await web3.eth.sendSignedTransaction(trustD.rawTransaction);

    console.log('new sign up & trust')
  }, 5000)

  // end step 5

  // step 6

  setTimeout(async () => {
    const transferTx = {
      to: hubAddress,
      data: hub.contract.methods.transferThrough(
        [accountB.address],
        [accountC.address],
        [accountB.address],
        ['12000000000000000000'],
      ).encodeABI(),
      gas: 17721975,
      from: accountC.address,
    };

    const transferC = await web3.eth.accounts.signTransaction(transferTx, accountC.privateKey);
    await web3.eth.sendSignedTransaction(transferC.rawTransaction);

    console.log('transfered');
  }, 6000);

  // end step 6

  // step 7

  setTimeout(async () => {
    const tokenAAddress = await hub.contract.methods.userToToken(accountA.address).call();
    const tokenA = await Token.at(tokenAAddress);

    const ubiTx = {
      to: tokenAAddress,
      data: tokenA.contract.methods.update().encodeABI(),
      gas: 10000000,
      from: accountA.address,
    };

    const ubiA = await web3.eth.accounts.signTransaction(ubiTx, accountA.privateKey);
    await web3.eth.sendSignedTransaction(ubiA.rawTransaction);

    console.log('ubi');
  }, 7000);

  // end step 7

  // step 8

  setTimeout(async () => {
    const tokenBAddress = await hub.contract.methods.userToToken(accountB.address).call();
    const tokenB = await Token.at(tokenBAddress);

    const accountE = "0xA6452911d5274e2717BC1Fa793b21aB600EC9133" //relayer

    const burnTx = {
      to: tokenBAddress,
      data: tokenB.contract.methods.transfer(accountE, '30000000000000000000').encodeABI(),
      gas: 10000000,
      from: accountB.address,
    };

    const burnB = await web3.eth.accounts.signTransaction(burnTx, accountB.privateKey);
    await web3.eth.sendSignedTransaction(burnB.rawTransaction);

    console.log('burned');
  }, 9000);
};

test();
