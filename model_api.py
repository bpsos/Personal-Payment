from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model

app = FastAPI()

# Load your model
model = load_model("Depression_dectection.h5")

# Define categorical feature order (must match training)
categorical_feature_names = [
    "Gender", "City", "Sleep Duration", "Dietary Habits",
    "Degree", "Have you ever had suicidal thoughts ?",
    "Family History of Mental Illness"
]

numerical_feature_names = [
    "CGPA", "Academic Pressure", "Study Satisfaction",
    "Work/Study Hours", "Financial Stress"
]

class InputData(BaseModel):
    # Adjust types according to your actual data
    CGPA: float
    Academic_Pressure: float
    Study_Satisfaction: float
    Work_Study_Hours: float
    Financial_Stress: float
    Gender: int
    City: int
    Sleep_Duration: int
    Dietary_Habits: int
    Degree: int
    Suicidal_Thoughts: int
    Family_History: int

@app.post("/predict")
async def predict(data: InputData):
    # Prepare numerical and categorical inputs
    numerical_input = np.array([[
        data.CGPA, data.Academic_Pressure, data.Study_Satisfaction,
        data.Work_Study_Hours, data.Financial_Stress
    ]])

    categorical_inputs = [
        np.array([[data.Gender]]),
        np.array([[data.City]]),
        np.array([[data.Sleep_Duration]]),
        np.array([[data.Dietary_Habits]]),
        np.array([[data.Degree]]),
        np.array([[data.Suicidal_Thoughts]]),
        np.array([[data.Family_History]])
    ]

    prediction = model.predict([numerical_input] + categorical_inputs)
    return {"prediction": float(prediction[0][0])}
