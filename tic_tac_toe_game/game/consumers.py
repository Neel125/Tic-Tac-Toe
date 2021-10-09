import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer


class TicTacToeConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        print(self.scope)
        self.room_name = self.scope["url_route"]["kwargs"]["room_code"]
        self.room_group_name = "room_" + self.room_name

        # join room group
        await self.channel_layer.group_add(
            self.room_group_name, self.channel_name
        )
        await self.accept()
        print("Socket connection established")

    async def disconnect(self, code):
        print("Disconnecting")
        await self.channel_layer.group_discard(
            self.room_group_name, self.channel_name
        )

    async def receive(self, text_data=None, bytes_data=None, **kwargs):
        """
        Recive message from the websockets
        Get the event and send the appropriate event
        """
        response = json.loads(text_data)
        print("response", response)
        event = response.get("event", None)
        message = response.get("message", None)
        if event == "MOVE":
            await self.channel_layer.group_send(self.room_group_name, {
                "type": "send_message",
                "message": message,
                "event": "MOVE"
            })
        if event == "START":
            # Send message to room group
            await self.channel_layer.group_send(self.room_group_name, {
                "type": "send_message",
                "message": message,
                "event": "START"
            })
        if event == "END":
            # Send message to room group
            await self.channel_layer.group_send(self.room_group_name, {
                "type": "send_message",
                "message": message,
                "event": "END"
            })

    async def send_message(self, res):
        """
        Send message to the WebSocket
        """
        await self.send(text_data=json.dumps({
            "payload": res
        }))
