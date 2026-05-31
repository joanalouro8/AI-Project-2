# House Price Prediction

Machine learning models to predict house sale prices in the Seattle area. Six models are compared across a real Kaggle dataset and an AI-generated synthetic dataset.

For the report, see [report.md](report.md).

---

## Project Structure

```
├── house_prices.csv           # Kaggle dataset
├── house_prices1.csv          # Generated dataset (produced by generator.py)
├── generator.py               # Script that generated the synthetic dataset
├── models_training.py         # Training, cross-validation, and model saving
├── predict.py                 # Load models and predict on a single house
├── app.py                     # Flask web app
├── models/                    # Saved .pkl model files (created after training)
├── templates/
│   └── index.html             # Web app UI
├── static/
│   ├── css/style.css
│   └── js/main.js
└── report.md                  # Full project report
```

## Setup

```bash
pip install -r requirements.txt
```

## Usage

### 1. Train the models

Trains all six models with 5-fold cross-validation and saves them to `models/`.

```bash
# Train on the Kaggle dataset
python3 models_training.py

# To train on the generated dataset, edit the load_data() to use "house_prices1.csv".
```

### 2. Predict on a single house

Edit the `house` dict at the bottom of `predict.py`, then run:

```bash
python3 predict.py
```

### 3. Run the web app

Requires models to be trained first.

```bash
python3 app.py
```

Open [http://localhost:5000](http://localhost:5000) in your browser.


## Dataset

The Kaggle dataset can be downloaded from:
https://www.kaggle.com/datasets/alyelbadry/house-pricing-dataset
The generated dataset can be recreated at any time by running `python generator.py`.