import os
import time
import joblib

import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import (
    make_scorer,
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)
from sklearn.model_selection import KFold, cross_validate
from sklearn.neighbors import KNeighborsRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVR
from lightgbm import LGBMRegressor
from sklearn.preprocessing import RobustScaler

CURRENT_YEAR = 2026

FEATURES = [
    "bedrooms",
    "bathrooms",
    "floors",
    "sqft_above",
    "sqft_basement",
    "sqft_lot",
    "sqft_living",
    "bath_per_bed",
    "waterfront",
    "condition",
    "view",
    "grade",
    "age",
    "years_since_renovation",
    "lat",
    "long",
]

def build_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df = df.replace([np.inf, -np.inf], np.nan)

    df["age"] = CURRENT_YEAR - df["yr_built"]
    df["years_since_renovation"] = CURRENT_YEAR - df["yr_renovated"]
    df.loc[df["yr_renovated"] == 0, "years_since_renovation"] = df["age"]
    df["bath_per_bed"] = df["bathrooms"] / df["bedrooms"].replace(0, np.nan)

    if "condition" in df.columns:
        df["condition"] = (
            df["condition"]
            .astype(str)
            .str.strip()
            .map({"Poor": 1, "Fair": 2, "Average": 3, "Good": 4, "Very Good": 5})
        )

    if "waterfront" in df.columns:
        df["waterfront"] = (
            df["waterfront"]
            .astype(str)
            .str.strip()
            .map({"Y": 1, "N": 0})
            .fillna(df["waterfront"])
        )

    return df


def load_data() -> tuple[pd.DataFrame, np.ndarray]:
    df = pd.read_csv("house_prices.csv")
    df = build_features(df)

    X = df[FEATURES].replace([np.inf, -np.inf], np.nan)
    X = X.fillna(X.median(numeric_only=True))
    y = np.log1p(df["price"])

    return X, y


def mae_price(y_true_log, y_pred_log):
    return mean_absolute_error(np.expm1(y_true_log), np.expm1(y_pred_log))


def rmse_price(y_true_log, y_pred_log):
    return np.sqrt(mean_squared_error(np.expm1(y_true_log), np.expm1(y_pred_log)))


def r2_price(y_true_log, y_pred_log):
    return r2_score(np.expm1(y_true_log), np.expm1(y_pred_log))


def mape_price(y_true_log, y_pred_log):
    yt = np.expm1(y_true_log)
    yp = np.expm1(y_pred_log)
    return np.mean(np.abs((yt - yp) / np.where(yt == 0, np.nan, yt))) * 100


def create_scorers() -> dict:
    return {
        "MAE": make_scorer(mae_price, greater_is_better=False),
        "RMSE": make_scorer(rmse_price, greater_is_better=False),
        "R2": make_scorer(r2_price, greater_is_better=True),
        "MAPE": make_scorer(mape_price, greater_is_better=False),
    }


def create_models() -> dict:
    return {
        "LightGBM": LGBMRegressor(
            n_estimators=500,
            max_depth=5,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            min_child_samples=10,
            random_state=42,
            verbose=-1,
            n_jobs=2,
        ),
        "Random Forest": RandomForestRegressor(
            n_estimators=200,
            max_depth=15,
            min_samples_leaf=5,
            random_state=42,
            n_jobs=2,
        ),
        "Neural Network": Pipeline(
            [
                ("scaler", RobustScaler()),
                (
                    "model",
                    MLPRegressor(
                        hidden_layer_sizes=(256, 128, 64, 32),  # deeper
                        activation="relu",
                        solver="adam",
                        learning_rate="adaptive",  # reduces lr when stuck
                        learning_rate_init=0.001,
                        alpha=0.1,  # much stronger regularization
                        max_iter=1000,
                        early_stopping=True,
                        validation_fraction=0.15,
                        n_iter_no_change=30,
                        random_state=42,
                    ),
                ),
            ]
        ),
        "SVR": Pipeline(
            [
                ("scaler", StandardScaler()),
                ("model", SVR(kernel="rbf", C=100, gamma="scale", epsilon=0.1)),
            ]
        ),
        "KNN": Pipeline(
            [
                ("scaler", StandardScaler()),
                ("model", KNeighborsRegressor(n_neighbors=8, weights="distance")),
            ]
        ),
        "Linear Regression": Pipeline(
            [
                ("scaler", StandardScaler()),
                ("model", LinearRegression()),
            ]
        ),
    }


def evaluate_models(models: dict, X, y, scorers: dict, k: int = 5) -> list[dict]:
    kf = KFold(n_splits=k, shuffle=True, random_state=42)
    results = []

    for name, model in models.items():
        t0 = time.time()
        cv = cross_validate(
            model, X, y, cv=kf, scoring=scorers, return_train_score=False, n_jobs=1
        )
        elapsed = time.time() - t0
        print(f"{name} ({elapsed:.1f}s)")

        mae = -cv["test_MAE"]
        rmse = -cv["test_RMSE"]
        r2 = cv["test_R2"]
        mape = -cv["test_MAPE"]

        results.append(
            {
                "Model": name,
                "MAE mean": mae.mean(),
                "MAE std": mae.std(),
                "RMSE mean": rmse.mean(),
                "RMSE std": rmse.std(),
                "R² mean": r2.mean(),
                "R² std": r2.std(),
                "MAPE mean": mape.mean(),
                "MAPE std": mape.std(),
                "_mae_raw": mae,
                "_r2_raw": r2,
            }
        )

    return results


def print_results(results: list[dict], k: int = 5) -> None:
    df = pd.DataFrame(results).sort_values("MAE mean")

    summary = df[["Model"]].copy()
    summary["MAE"] = df.apply(
        lambda r: f"${r['MAE mean']:,.0f} ±{r['MAE std']:,.0f}", axis=1
    )
    summary["RMSE"] = df.apply(
        lambda r: f"${r['RMSE mean']:,.0f} ±{r['RMSE std']:,.0f}", axis=1
    )
    summary["R²"] = df.apply(lambda r: f"{r['R² mean']:.4f} ±{r['R² std']:.4f}", axis=1)
    summary["MAPE"] = df.apply(
        lambda r: f"{r['MAPE mean']:.2f}% ±{r['MAPE std']:.2f}%", axis=1
    )

    print("\nResults:\n")
    print(summary.to_string(index=False))

    folds = pd.DataFrame(
        {r["Model"]: r["_mae_raw"] for r in results},
        index=[f"Fold {i+1}" for i in range(k)],
    ).T.sort_values("Fold 1")

    print("\nPer-fold MAE:\n")
    print(folds.to_string())


def save_models(models: dict, X, y) -> None:
    os.makedirs("models", exist_ok=True)

    for name, model in models.items():
        model.fit(X, y)
        filename = name.lower().replace(" ", "_")
        joblib.dump(model, f"models/{filename}.pkl")

    joblib.dump(FEATURES, "models/features.pkl")


def main() -> None:
    X, y = load_data()
    models = create_models()
    scorers = create_scorers()

    results = evaluate_models(models, X, y, scorers)
    print_results(results)
    save_models(models, X, y)


if __name__ == "__main__":
    main()
