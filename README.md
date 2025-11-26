Project Overview

This is a machine learning–based prediction app built as my college project.
The model predicts outcomes based on the input features given by the user.
The project includes:
	•	A trained ML model
	•	A backend API for predictions
	•	A clean, responsive frontend
	•	Deployment using Vercel

The aim is to demonstrate how ML models can be deployed as real web apps.

⸻

📊 Machine Learning Details

Model Used

The app uses a Gradient Boosting Machine (GBM) model.

Why GBM?
	•	Works very well on tabular (spreadsheet-type) data
	•	Handles nonlinear patterns
	•	Usually more accurate than simple models
	•	Used in many industry ML tasks

How it works (simple explanation)

GBM builds many small decision trees, where:
	•	Tree 1 makes the first prediction
	•	Tree 2 fixes the mistakes of Tree 1
	•	Tree 3 fixes the mistakes of Tree 2
	•	And so on…

Finally, all trees together make one strong prediction.

⸻

🧠 Training Process (Simple Explanation)
	1.	Data is cleaned and prepared
	2.	Model learns patterns using Gradient Boosting
	3.	Model is tested for accuracy
	4.	Best-performing model is saved
	5.	This model is connected to the web app for live predictions

⸻

🖥 Tech Stack

Frontend
	•	HTML
	•	CSS
	•	JavaScript
	•	Responsive UI

Backend
	•	Python
	•	FastAPI / Flask (based on Lovable’s setup)
	•	Pickle joblib for loading ML model

ML Framework
	•	Scikit-learn (sklearn)

Deployment
	•	Vercel (frontend)
	•	Model served via API
  How the App Works
	1.	User enters values in the form
	2.	The frontend sends the inputs to the backend
	3.	ML model processes the data and predicts
	4.	Result is shown instantly on the screen
