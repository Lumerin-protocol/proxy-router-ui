const { encrypt, decrypt } = require('ecies-geth');

const encryptMessage = async (pubKey, msg) => {
	const ciphertext = await encrypt(Buffer.from(pubKey, 'hex'), Buffer.from(msg));
	return ciphertext;
};


const decrypt1 = async (pubKey, msg) => {
	const ciphertext = await decrypt(Buffer.from(pubKey, 'hex'), Buffer.from(msg));
	return ciphertext;
};

encryptMessage("04451961c396e6f5c2124158382faf30cdb88c857d9ea087a6f9624b47689b1fd6645c84bb45c2502190adfca047f32fd0572e6e51b98ed531fe3fc1f678a21515", "stratum+tcp://bogdaner2:@stratum.braiins.com:3333").then(d => console.log(d.toString('hex')));


decrypt1("24c1613e07ac889f90c08f728f281e61f5e6b95d3d69c307513599f463c7d237", "0470f45115e6238c51dd31b427df671a04f3d896c3c7562d956e2531b27cfab94d7070c1874ff1d398a9c495857fe9579edf7e4e83f1009037341c0c85a0e41e15567f9671e48e02eb560fc126fcd3f715e389874d126eabcd6cde02a3dfa77143fc2a5c6ce89965445e09e1e04c5dba85fae06b63ada9dbe477507b589abcbb6a0c0dadf2ff687974b6162cb1a0b458c0cda523adebd95d31ad3ee65274a905c2c8").then(console.log);
//console.log(a);