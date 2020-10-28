require('dotenv').config();
const axios = require('axios');
const Web3 = require('web3');
const LinkTokenJson = require('@chainlink/contracts/abi/v0.4/LinkToken.json');
const {
	ACCESSKEY,
	SECRET,
	JOB_ID,
	LINK_TOKEN_ADDRESS,
	WALLET_ADDRESS,
	GETH_URL,
	CHAINLINK_NODE
} = process.env;
const web3 = new Web3(GETH_URL);

const initializeJob = async ({ from, value }) => {
	try {
		const response = await axios({
			method: 'post',
			url: `${CHAINLINK_NODE}/v2/specs/${JOB_ID}/runs`,
			headers: {
				'X-Chainlink-EA-AccessKey': ACCESSKEY,
				'X-Chainlink-EA-Secret': SECRET
			},
			body: {
				from,
				value
			}
		});
		console.log('Jon initialized', response);
	} catch (error) {
		console.error(error);
	}
};

const listenTransfers = async () => {
	const { abi } = LinkTokenJson.compilerOutput;
	const tokenContract = new web3.eth.Contract(abi, LINK_TOKEN_ADDRESS);
	tokenContract.events
		.Transfer(
			{
				filter: { to: WALLET_ADDRESS },
				fromBlock: 0
			},
			(error, event) => {
				if (!error) {
					const { returnValues } = event;
					const { from, value } = returnValues;
					await initializeJob({ from, value });
				} else {
					console.error(error);
				}
			}
		)
		.on('connected', function (subscriptionId) {
			console.log('connected', subscriptionId);
		});
};

listenTransfers();
