// UTF-8
'use strict';
const cfdjs = require('cfd-js');

// const toSatoshiAmount = function(amount) {
//   return Number(amount * 100000000);
// };

// -----------------------------------------------------------------------------
function readInput(question) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    readline.question(question, (answer) => {
      resolve(answer);
      readline.close();
    });
  });
}

const GenerateKeyPair = function(network = 'regtest', wif = true, isCompressed = true) {
  const result = cfdjs.CreateKeyPair({
    wif: wif,
    network: network,
    isCompressed: isCompressed,
  });
  return {pubkey: result.pubkey, privkey: result.privkey};
};

/*
const CreatePubkeyAddress = function(pubkey, network = 'regtest', hashType = 'p2wpkh') {
  const result = cfdjs.CreateAddress({
    'keyData': {
      'hex': pubkey,
      'type': 'pubkey',
    },
    'network': network,
    'isElements': true,
    'hashType': hashType,
  });
  return result.address;
};

const CreateConfidentialPubkeyAddress = function(pubkey, confidentialKey, network = 'regtest', hashType = 'p2wpkh') {
  const addr = CreatePubkeyAddress(pubkey, network, hashType);
  const result = cfdjs.GetConfidentialAddress({
    'unblindedAddress': addr,
    'key': confidentialKey,
  });
  return result.confidentialAddress;
};
*/

const checkString = function(arg, matchText, alias = undefined) {
  if (arg == matchText) {
    return true;
  } else if ((alias) && (arg == alias)) {
    return true;
  }
  return false;
};

// -----------------------------------------------------------------------------

function strToBool(str) {
  return (str == 'true') ? true : false;
}
// const toBigInt = function(n) {
//   let s = bigInt(n).toString(16);
//   while (s.length < 16) s = '0' + s;
//   return new Uint8Array(Buffer.from(s, 'hex'));
// };

// -----------------------------------------------------------------------------

const generatekey = async function() {
  let network = 'regtest';
  let wif = true;
  let isCompressed = true;
  if (process.argv.length > 3) network = process.argv[3];
  if (process.argv.length > 4) wif = strToBool(process.argv[4]);
  if (process.argv.length > 5) isCompressed = strToBool(process.argv[5]);
  const result = GenerateKeyPair(network, wif, isCompressed);
  console.log(result);
};

const decoderawtransaction = async function() {
  let network = 'regtest';
  if (process.argv.length < 4) {
    network = await readInput('network(mainnet,regtest,testnet) > ');
  } else {
    network = process.argv[3];
  }
  if (network === '') network = 'regtest';

  let tx = '';
  if (process.argv.length < 5) {
    const workTx = await readInput('tx > ');
    tx += workTx.trim();
  } else {
    tx = process.argv[4];
  }
  let decTx = '';
  try {
    decTx = cfdjs.ElementsDecodeRawTransaction({
      hex: tx,
      mainchainNetwork: network,
    });
    console.log(JSON.stringify(decTx, null, 2));
    return;
  } catch (err) {
  }
  try {
    decTx = cfdjs.DecodeRawTransaction({
      hex: tx,
      network: network,
    });
    console.log(JSON.stringify(decTx, null, 2));
  } catch (err) {
    console.log(err);
    console.log(`tx = ${tx}`);
  }
};

const getaddressinfo = async function() {
  let address = '';
  if (process.argv.length < 4) {
    address = await readInput('address > ');
  } else {
    address = process.argv[3];
  }
  let confidentialKey = '';
  try {
    const ckey = cfdjs.GetUnblindedAddress({
      confidentialAddress: address,
    });
    confidentialKey = ckey.confidentialKey;
    address = ckey.unblindedAddress;
  } catch (err) {
    // console.log(err);
  }

  try {
    const addrinfo = cfdjs.GetAddressInfo({
      address: address,
      isElements: true,
    });
    if (confidentialKey !== '') {
      addrinfo['confidential_key'] = confidentialKey;
    }
    console.log(JSON.stringify(addrinfo, null, 2));
    return;
  } catch (err) {
    // console.log(err);
  }

  const addrinfo = cfdjs.GetAddressInfo({
    address: address,
    isElements: false,
  });
  console.log(JSON.stringify(addrinfo, null, 2));
};

const decodescript = async function() {
  let script = '';
  if (process.argv.length < 4) {
    script = await readInput('script > ');
  } else {
    script = process.argv[3];
  }
  let dumpString = false;
  if (process.argv.length >= 5) {
    dumpString = (process.argv[4] === 'true');
  }

  const scriptinfo = cfdjs.ParseScript({
    script: script,
  });
  if (dumpString) {
    const str = addrinfo.scriptItems.toString();
    console.log('asm:', str.replace(/,/gi, ' '));
  } else {
    console.log(JSON.stringify(scriptinfo, null, 2));
  }
};

const parsedescriptor = async function() {
  let network = 'regtest';
  if (process.argv.length < 4) {
    network = await readInput('network > ');
  } else {
    network = process.argv[3];
  }
  let isElements = false;
  if (network === 'liquidregtest') {
    network = 'regtest';
    isElements = true;
  } else if (network === 'liquidv1') {
    isElements = true;
  } else if (network === '') {
    network = 'regtest';
  }

  let descriptor = '';
  if (process.argv.length < 5) {
    descriptor = await readInput('descriptor > ');
  } else {
    descriptor = process.argv[4];
  }
  let path = '';
  if (process.argv.length < 6) {
    path = await readInput('bip32DerivationPath > ');
  } else {
    path = process.argv[5];
  }

  const descriptorInfo = cfdjs.ParseDescriptor({
    isElements: isElements,
    descriptor: descriptor,
    network: network,
    bip32DerivationPath: path,
  });
  console.log(JSON.stringify(descriptorInfo, null, 2));
};

const getextkeyinfo = async function() {
  let extkey = '';
  if (process.argv.length < 4) {
    extkey = await readInput('extkey > ');
  } else {
    extkey = process.argv[3];
  }
  let network = 'regtest';
  if (process.argv.length < 5) {
    network = await readInput('network > ');
  } else {
    network = process.argv[4];
  }
  let isCompressKeyStr = 'true';
  if (process.argv.length < 5) {
    isCompressKeyStr = await readInput('isCompressKey > ');
  } else {
    isCompressKeyStr = process.argv[4];
  }
  const isCompressKey = (isCompressKeyStr !== 'false');

  const extkeyInfo = cfdjs.GetExtkeyInfo({
    extkey: extkey,
  });

  let privkey = undefined;
  try {
    privkey = cfdjs.GetPrivkeyFromExtkey({
      extkey: extkey,
      network: network,
      wif: true,
      isCompressed: isCompressKey,
    });
    const privkeyHex = cfdjs.GetPrivkeyFromExtkey({
      extkey: extkey,
      network: network,
      wif: false,
      isCompressed: isCompressKey,
    });
    privkey['hex'] = privkeyHex.privkey;
  } catch (err) {
  }

  let pubkey = undefined;
  try {
    pubkey = cfdjs.GetPubkeyFromExtkey({
      extkey: extkey,
      network: network,
    });
  } catch (err) {
  }

  if (privkey !== undefined) {
    extkeyInfo['extpubkey'] = cfdjs.CreateExtPubkey({
      extkey: extkey,
      network: network,
    }).extkey;
    extkeyInfo['privkey'] = privkey;
  }
  if (pubkey !== undefined) {
    extkeyInfo['pubkey'] = pubkey.pubkey;
  }
  console.log(JSON.stringify(extkeyInfo, null, 2));
};

const createextkey = async function() {
  let basekey = '';
  if (process.argv.length < 4) {
    basekey = await readInput('extkey or seed > ');
  } else {
    basekey = process.argv[3];
  }
  let path = '';
  if (process.argv.length < 5) {
    path = await readInput('bip32DerivationPath > ');
  } else {
    path = process.argv[4];
  }
  if ((path === '\'\'') || (path === '""')) {
    path = '';
  }
  if ((path.length > 2) && (path.charAt(0) === '\'') && (path.charAt(path.length - 1) === '\'')) {
    path = path.substring(1, path.length - 1);
  }

  let network = 'regtest';
  if (process.argv.length < 6) {
    network = await readInput('network > ');
  } else {
    network = process.argv[5];
  }
  if (network === '') network = 'regtest';

  try {
    cfdjs.GetExtkeyInfo({
      extkey: basekey,
    });
  } catch (err) {
    // seed
    const extkeyInfo = cfdjs.CreateExtkeyFromSeed({
      seed: basekey,
      network: network,
      extkeyType: 'extPrivkey',
    });
    basekey = extkeyInfo.extkey;
  }

  let child = undefined;
  if (path !== '') {
    try {
      child = cfdjs.CreateExtkeyFromParentPath({
        extkey: basekey,
        network: network,
        extkeyType: 'extPrivkey',
        path: path,
      });
    } catch (err) {
      console.log(err);
      child = cfdjs.CreateExtkeyFromParentPath({
        extkey: basekey,
        network: network,
        extkeyType: 'extPubkey',
        path: path,
      });
    }
  }

  if (child !== undefined) {
    console.log(`key = ${child.extkey}`);
    console.log(`path: ${path}`);
  } else {
    console.log(`key = ${basekey}`);
  }
};

const estimatefee = async function() {
  let feeStr = '1.0';
  if (process.argv.length < 4) {
    feeStr = await readInput('feeRate > ');
  } else {
    feeStr = process.argv[3];
  }
  const feeRate = Number(feeStr);

  let feeAsset = '';
  if (process.argv.length < 5) {
    feeAsset = await readInput('feeAsset > ');
  } else {
    feeAsset = process.argv[4];
  }
  if ((feeAsset === '\'\'') || (feeAsset === '""')) {
    feeAsset = '';
  }

  let tx = '';
  if (process.argv.length < 6) {
    tx = await readInput('tx > ');
  } else {
    tx = process.argv[5];
  }

  try {
    const feeInfo = cfdjs.EstimateFee({
      feeRate: feeRate,
      tx: tx,
      isElements: false,
    });
    console.log('feeInfo =', feeInfo);
    return;
  } catch (err) {
    // do nothing
  }

  const feeInfo = cfdjs.EstimateFee({
    feeRate: feeRate,
    tx: tx,
    isElements: true,
    feeAsset: feeAsset,
    isBlind: true,
  });
  console.log('feeInfo =', feeInfo);
};

// -----------------------------------------------------------------------------

const commandData = {
  decoderawtransaction: {
    name: 'decoderawtransaction',
    alias: 'dectx',
    parameter: '<network> <tx>',
    function: decoderawtransaction,
  },
  decodescript: {
    name: 'decodescript',
    alias: 'script',
    parameter: '<script> [<show string>]',
    function: decodescript,
  },
  getaddressinfo: {
    name: 'getaddressinfo',
    alias: 'daddr',
    parameter: '<address>',
    function: getaddressinfo,
  },
  parsedescriptor: {
    name: 'parsedescriptor',
    alias: 'pdesc',
    parameter: '<network(mainnet,testnet,regtest,liquidv1,liquidregtest)> <descriptor> [<derivePath>]',
    function: parsedescriptor,
  },
  getextkeyinfo: {
    name: 'getextkeyinfo',
    alias: 'keyinfo',
    parameter: '<network(mainnet,testnet,regtest,liquidv1,liquidregtest)> <descriptor> <derivePath>',
    function: getextkeyinfo,
  },
  createextkey: {
    name: 'createextkey',
    alias: 'extkey',
    parameter: '<descriptor or seed> <derivePath> <network>',
    function: createextkey,
  },
  estimatefee: {
    name: 'estimatefee',
    alias: 'fee',
    parameter: '<feeRate> <feeAsset> <tx>',
    function: estimatefee,
  },
  generatekey: {
    name: 'generatekey',
    alias: 'genkey',
    parameter: '[<network> [<wif> [<isCompressed>]]]',
    function: generatekey,
  },
};

const helpDump = function(nameobj) {
  if (!nameobj.parameter) {
    console.log('  ' + nameobj.name);
  } else {
    console.log('  ' + nameobj.name + ' ' + nameobj.parameter);
  }
  if (nameobj.alias) {
    console.log('    - alias: ' + nameobj.alias);
  }
};

const help = function() {
  console.log('usage:');
  for (const key in commandData) {
    if (commandData[key]) helpDump(commandData[key]);
  }
};

// -----------------------------------------------------------------------------
const main = async () =>{
  try {
    if (process.argv.length > 2) {
      const cmd = process.argv[2].trim();
      for (const key in commandData) {
        if (commandData[key]) {
          const cmdData = commandData[key];
          if (checkString(cmd, cmdData.name, cmdData.alias)) {
            cmdData.function();
            return 0;
          }
        }
      }
    }

    for (let i = 0; i < process.argv.length; i++) {
      console.log('argv[' + i + '] = ' + process.argv[i]);
    }
    help();
  } catch (error) {
    console.log(error);
  }
  return 1;
};
main();
