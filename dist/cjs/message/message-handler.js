"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageHandler = void 0;
const types_1 = require("../types");
const _1 = require(".");
class MessageHandler {
    async onPayload(message, hc) {
        const parsedData = message.data;
        if (message.origin)
            parsedData.origin = message.origin;
        if (hc.debug)
            console.log(`hashconnect - Message Received of type ${message.type}, sent at ${message.timestamp.toString()}`, parsedData);
        // Should always have a topic
        if (!parsedData.topic) {
            console.error("hashconnect - no topic in message");
        }
        switch (message.type) {
            case _1.RelayMessageType.ApprovePairing:
                if (hc.debug)
                    console.log("hashconnect - approved", message.data);
                let approval_data = message.data;
                let newPairingData = {
                    accountIds: approval_data.accountIds,
                    metadata: approval_data.metadata,
                    network: approval_data.network,
                    topic: approval_data.topic,
                    origin: approval_data.origin,
                    encryptionKey: hc.hcData.encryptionKey,
                    lastUsed: new Date().getTime()
                };
                approval_data.pairingData = newPairingData;
                hc.pairingEvent.emit(approval_data);
                hc.connectionStatusChangeEvent.emit(types_1.HashConnectConnectionState.Paired);
                await hc.acknowledge(parsedData.topic, hc.encryptionKeys[approval_data.topic], approval_data.id);
                break;
            case _1.RelayMessageType.Acknowledge:
                let ack_data = message.data;
                if (hc.debug)
                    console.log("hashconnect - acknowledged - id: " + ack_data.msg_id);
                hc.acknowledgeMessageEvent.emit(ack_data);
                break;
            case _1.RelayMessageType.Transaction:
                if (hc.debug)
                    console.log("hashconnect - Got transaction", message);
                let transaction_data = message.data;
                transaction_data.byteArray = new Uint8Array(Buffer.from(transaction_data.byteArray, 'base64'));
                hc.transactionEvent.emit(transaction_data);
                await hc.acknowledge(parsedData.topic, hc.encryptionKeys[transaction_data.topic], transaction_data.id);
                break;
            case _1.RelayMessageType.TransactionResponse:
                if (hc.debug)
                    console.log("hashconnect - Got transaction response", message);
                let transaction_response_data = message.data;
                if (transaction_response_data.signedTransaction)
                    transaction_response_data.signedTransaction = new Uint8Array(Buffer.from(transaction_response_data.signedTransaction, 'base64'));
                if (transaction_response_data.receipt)
                    transaction_response_data.receipt = new Uint8Array(Buffer.from(transaction_response_data.receipt, 'base64'));
                if (transaction_response_data.response)
                    transaction_response_data.response = JSON.parse(transaction_response_data.response);
                hc.transactionResolver(transaction_response_data);
                await hc.acknowledge(parsedData.topic, hc.encryptionKeys[transaction_response_data.topic], transaction_response_data.id);
                break;
            case _1.RelayMessageType.AdditionalAccountRequest:
                if (hc.debug)
                    console.log("hashconnect - Got account info request", message);
                let request_data = message.data;
                hc.additionalAccountRequestEvent.emit(request_data);
                await hc.acknowledge(parsedData.topic, hc.encryptionKeys[request_data.topic], request_data.id);
                break;
            case _1.RelayMessageType.AdditionalAccountResponse:
                if (hc.debug)
                    console.log("hashconnect - Got account info response", message);
                let response_data = message.data;
                hc.additionalAccountResolver(response_data);
                await hc.acknowledge(parsedData.topic, hc.encryptionKeys[response_data.topic], response_data.id);
                break;
            //auth
            case _1.RelayMessageType.AuthenticationRequest:
                if (hc.debug)
                    console.log("hashconnect - Got auth request", message);
                let auth_request_data = message.data;
                auth_request_data.serverSignature = new Uint8Array(Buffer.from(auth_request_data.serverSignature, 'base64'));
                hc.authRequestEvent.emit(auth_request_data);
                await hc.acknowledge(parsedData.topic, hc.encryptionKeys[auth_request_data.topic], auth_request_data.id);
                break;
            case _1.RelayMessageType.AuthenticationResponse:
                if (hc.debug)
                    console.log("hashconnect - Got auth response", message);
                let auth_response_data = message.data;
                if (auth_response_data.userSignature)
                    auth_response_data.userSignature = new Uint8Array(Buffer.from(auth_response_data.userSignature, 'base64'));
                if (auth_response_data.signedPayload && auth_response_data.signedPayload.serverSignature)
                    auth_response_data.signedPayload.serverSignature = new Uint8Array(Buffer.from(auth_response_data.signedPayload.serverSignature, 'base64'));
                hc.authResolver(auth_response_data);
                await hc.acknowledge(parsedData.topic, hc.encryptionKeys[auth_response_data.topic], auth_response_data.id);
                break;
            //signing
            case _1.RelayMessageType.SigningRequest:
                if (hc.debug)
                    console.log("hashconnect - Got sign request", message);
                let sign_request_data = message.data;
                hc.signRequestEvent.emit(sign_request_data);
                await hc.acknowledge(parsedData.topic, hc.encryptionKeys[sign_request_data.topic], sign_request_data.id);
                break;
            case _1.RelayMessageType.SigningResponse:
                if (hc.debug)
                    console.log("hashconnect - Got sign response", message);
                let sign_response_data = message.data;
                if (sign_response_data.userSignature)
                    sign_response_data.userSignature = new Uint8Array(Buffer.from(sign_response_data.userSignature, 'base64'));
                hc.signResolver(sign_response_data);
                await hc.acknowledge(parsedData.topic, hc.encryptionKeys[sign_response_data.topic], sign_response_data.id);
                break;
            default:
                break;
        }
    }
}
exports.MessageHandler = MessageHandler;
//# sourceMappingURL=message-handler.js.map