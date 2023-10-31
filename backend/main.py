from flask import Flask, request, Response
from flask_cors import CORS
from ai import get_ai_response, transcribe
from elevenlabs import generate, stream, set_api_key
import key
app = Flask(__name__)

CORS(app)

set_api_key(key.ELEVENLABS_API_KEY)

@app.route("/speak", methods=["POST"])
def speak():
    # get a blob audio and respond vocally
    question = transcribe(request)
    generate_response = get_ai_response(question)

    audio = generate(
        text=generate_response(),
        voice="Domi",
        model="eleven_multilingual_v2",
        stream=True
    )
    stream(audio)

    return Response(audio, mimetype="audio/wav")

if __name__ == "__main__":
    app.run(debug=True)