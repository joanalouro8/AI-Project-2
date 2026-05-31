import joblib
import numpy as np
import pandas as pd

from models_training import build_features

MODEL_FILES = {
    "Linear Regression": "linear_regression",
    "Random Forest": "random_forest",
    "LightGBM": "lightgbm",
    "SVR": "svr",
    "KNN": "knn",
    "Neural Network": "neural_network",
}


def load_models(variant: str = "") -> dict:
    """
    Load all models. Pass variant="1" to use the *1.pkl set.
    """
    suffix = f"{variant}.pkl" if variant else ".pkl"
    return {
        name: joblib.load(f"models/{filename}{suffix}")
        for name, filename in MODEL_FILES.items()
    }


def load_features() -> list:
    return joblib.load(f"models/features.pkl")


def predict(house_data: dict, variant: str = "") -> dict[str, float]:
    models = load_models(variant)
    features = load_features()

    df = pd.DataFrame([house_data])
    df = build_features(df)
    df = df.reindex(columns=features)

    df = df.replace([np.inf, -np.inf], np.nan)
    df = df.fillna(0)

    return {name: np.expm1(model.predict(df)[0]) for name, model in models.items()}

def print_predictions(predictions: dict[str, float]) -> None:
    print("\nPredictions:\n")
    for name, price in sorted(predictions.items(), key=lambda x: x[1]):
        print(f"  {name:<22} ${price:,.0f}")


if __name__ == "__main__":

    house = {
        "bedrooms": 2,
        "bathrooms": 2,
        "floors": 1,
        "sqft_living": 1006,
        "sqft_lot": 0,
        "sqft_above": 1006,
        "sqft_basement": 0,
        "waterfront": 1,
        "view": 3,
        "condition": 4,
        "grade": 8,
        "yr_built": 1996,
        "yr_renovated": 1996,
        "lat": 47.6319718,
        "long": -122.3569874,
    }

    print_predictions(predict(house))
    print_predictions(predict(house, variant="1"))
