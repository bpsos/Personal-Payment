from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Load your model
model = load_model("Depression_dectection.keras")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 👈 Use ["https://yourusername.github.io"] to restrict
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InputData(BaseModel):
    # Adjust types according to the JavaScript payload
    Age: int
    CGPA: float
    Academic_Pressure: int
    Study_Satisfaction: int
    Work_Study_Hours: int
    Financial_Stress: int
    Gender: int
    Sleep_Duration: int
    Dietary_Habits: int
    Degree: int
    Suicidal_Thoughts: int
    Family_History: int

@app.post("/predict")
async def predict(data: InputData):
    # Prepare numerical and categorical inputs based on the payload
    numerical_input = np.array([[data.Age, data.CGPA, data.Academic_Pressure, data.Study_Satisfaction,
        data.Work_Study_Hours, data.Financial_Stress]])

    categorical_inputs = [
        np.array([[data.Gender]]),
        np.array([[data.Sleep_Duration]]),
        np.array([[data.Dietary_Habits]]),
        np.array([[data.Degree]]),
        np.array([[data.Suicidal_Thoughts]]),
        np.array([[data.Family_History]])
    ]

    prediction = model.predict([numerical_input] + categorical_inputs)
    return {"prediction": float(prediction[0][0])}
