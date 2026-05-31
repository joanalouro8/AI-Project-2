import joblib
import numpy as np
import pandas as pd

from cross_validation import FEATURES, build_features

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
        "bedrooms": 4,
        "bathrooms": 3,
        "floors": 2,
        "sqft_living": 2800,
        "sqft_lot": 9000,
        "sqft_above": 2200,
        "sqft_basement": 600,
        "waterfront": 0,
        "view": 1,
        "condition": 3,
        "grade": 9,
        "yr_built": 1990,
        "yr_renovated": 0,
        "lat": 47.5085,
        "long": -122.2440,
    }

    print_predictions(predict(house))
    print_predictions(predict(house, variant="1"))
