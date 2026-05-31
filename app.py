import os
import joblib
import numpy as np
import pandas as pd
from flask import Flask, render_template, request, jsonify

from predict import load_features, load_models
from cross_validation import build_features

app = Flask(__name__)

_model_cache = {}
_features_cache = None

def get_models(variant: str = "") -> dict:
    """
    Get cached models for the specified variant, or load and cache them if not already in memory.
    """
    if variant not in _model_cache:
        _model_cache[variant] = load_models(variant)
    return _model_cache[variant]

def get_features() -> list:
    """
    Get cached feature names.
    """
    global _features_cache
    if _features_cache is None:
        _features_cache = load_features()
    return _features_cache

def predict_single(house_data: dict, variant: str = "") -> dict[str, float]:
    """
    Predict the price using all loaded models for the given variant.
    """
    models = get_models(variant)
    features = get_features()

    df = pd.DataFrame([house_data])
    df = build_features(df)
    
    derived_info = {
        "age": int(df["age"].iloc[0]) if "age" in df.columns else None,
        "years_since_renovation": int(df["years_since_renovation"].iloc[0]) if "years_since_renovation" in df.columns else None,
        "bath_per_bed": float(df["bath_per_bed"].iloc[0]) if "bath_per_bed" in df.columns and not pd.isna(df["bath_per_bed"].iloc[0]) else None,
    }

    df = df.reindex(columns=features)
    df = df.replace([np.inf, -np.inf], np.nan)
    df = df.fillna(0)

    predictions = {}
    for name, model in models.items():
        try:
            pred_log = model.predict(df)[0]
            predictions[name] = float(np.expm1(pred_log))
        except Exception as e:
            predictions[name] = 0.0
            print(f"Error predicting with {name}: {e}")

    return {
        "predictions": predictions,
        "derived": derived_info
    }

@app.route("/")
def index():
    """
    Render the main UI dashboard page.
    """
    return render_template("index.html")

@app.route("/api/predict", methods=["POST"])
def api_predict():
    """
    API endpoint for housing price prediction.
    Expects JSON containing house parameters and selected variant.
    """
    try:
        data = request.json or {}
        variant = data.get("variant", "")
        
        house_data = {
            "bedrooms": int(data.get("bedrooms", 3)),
            "bathrooms": float(data.get("bathrooms", 2.0)),
            "floors": float(data.get("floors", 1.0)),
            "sqft_living": int(data.get("sqft_living", 1800)),
            "sqft_lot": int(data.get("sqft_lot", 5000)),
            "sqft_above": int(data.get("sqft_above", 1500)),
            "sqft_basement": int(data.get("sqft_basement", 0)),
            "waterfront": data.get("waterfront", "N"),
            "view": int(data.get("view", 0)),
            "condition": data.get("condition", "Average"),
            "grade": int(data.get("grade", 7)),
            "yr_built": int(data.get("yr_built", 1980)),
            "yr_renovated": int(data.get("yr_renovated", 0)),
            "lat": float(data.get("lat", 47.56)),
            "long": float(data.get("long", -122.25)),
        }
        
        result = predict_single(house_data, variant)
        return jsonify({
            "success": True,
            "predictions": result["predictions"],
            "derived": result["derived"],
            "input_received": house_data
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400

if __name__ == "__main__":
    print("Pre-loading standard models...")
    try:
        get_models("")
        print("Standard models loaded successfully!")
    except Exception as e:
        print(f"Warning: could not pre-load standard models: {e}")
        
    app.run(host="0.0.0.0", port=5000, debug=True)
