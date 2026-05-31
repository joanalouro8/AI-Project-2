import pandas as pd
import numpy as np

np.random.seed(42)
n = 21613  # same size as the real King County dataset

# =========================
# LOCATION (Seattle area)
# =========================
lat = np.random.uniform(47.15, 47.78, n)
long = np.random.uniform(-122.52, -121.31, n)

# Zipcodes (simplified Seattle area)
zipcodes = np.random.choice(
    [
        98001,
        98002,
        98003,
        98004,
        98005,
        98006,
        98007,
        98008,
        98010,
        98011,
        98014,
        98019,
        98022,
        98023,
        98024,
        98027,
        98028,
        98029,
        98030,
        98031,
        98032,
        98033,
        98034,
        98038,
        98039,
        98040,
        98042,
        98045,
        98052,
        98053,
        98055,
        98056,
        98057,
        98058,
        98059,
        98065,
        98070,
        98072,
        98074,
        98075,
        98077,
        98092,
        98102,
        98103,
        98105,
        98107,
        98108,
        98109,
        98112,
        98115,
        98116,
        98117,
        98118,
        98119,
        98122,
        98125,
        98126,
        98133,
        98136,
        98144,
        98146,
        98148,
        98155,
        98166,
        98168,
        98177,
        98178,
        98188,
        98198,
        98199,
    ],
    n,
)

# =========================
# HOUSE CHARACTERISTICS
# =========================
bedrooms = np.random.choice(
    [1, 2, 3, 4, 5, 6], n, p=[0.04, 0.20, 0.40, 0.25, 0.09, 0.02]
)
bathrooms = np.random.choice(
    [1.0, 1.5, 2.0, 2.25, 2.5, 2.75, 3.0, 3.5, 4.0],
    n,
    p=[0.10, 0.08, 0.25, 0.10, 0.20, 0.08, 0.10, 0.06, 0.03],
)
floors = np.random.choice(
    [1.0, 1.5, 2.0, 2.5, 3.0], n, p=[0.45, 0.10, 0.35, 0.05, 0.05]
)

sqft_living = (
    (bedrooms * 350 + bathrooms * 200 + np.random.normal(0, 300, n))
    .clip(500, 8000)
    .astype(int)
)
sqft_above = (sqft_living * np.random.uniform(0.5, 1.0, n)).astype(int)
sqft_basement = (sqft_living - sqft_above).astype(int)
sqft_lot = np.random.lognormal(8.5, 0.8, n).clip(500, 1_500_000).astype(int)
sqft_living15 = (sqft_living + np.random.normal(0, 200, n)).clip(500, 6000).astype(int)
sqft_lot15 = (sqft_lot + np.random.normal(0, 500, n)).clip(500, 500_000).astype(int)

yr_built = np.random.randint(1900, 2016, n)
yr_renovated = np.where(np.random.rand(n) < 0.05, np.random.randint(1980, 2016, n), 0)

grade = np.random.choice(
    range(1, 14),
    n,
    p=[
        0.001,
        0.002,
        0.005,
        0.01,
        0.05,
        0.10,
        0.25,
        0.25,
        0.15,
        0.10,
        0.05,
        0.02,
        0.012,
    ],
)
condition = np.random.choice(
    ["Poor", "Fair", "Average", "Good", "Very Good"],
    n,
    p=[0.01, 0.05, 0.55, 0.30, 0.09],
)
view = np.random.choice([0, 1, 2, 3, 4], n, p=[0.85, 0.05, 0.05, 0.03, 0.02])
waterfront = np.random.choice(["Y", "N"], n, p=[0.007, 0.993])

# =========================
# SALE DATE (2014–2015)
# =========================
start = pd.Timestamp("2014-05-02")
end = pd.Timestamp("2015-05-27")
days = (end - start).days
dates = [start + pd.Timedelta(days=int(d)) for d in np.random.randint(0, days, n)]
date_str = [d.strftime("%Y%m%dT000000") for d in dates]

# =========================
# PRICE (realistic formula)
# =========================
cond_map = {"Poor": 1, "Fair": 2, "Average": 3, "Good": 4, "Very Good": 5}
cond_num = np.array([cond_map[c] for c in condition])
wf_num = np.where(waterfront == "Y", 1, 0)
age = 2026 - yr_built

price = (
    50_000  # base
    + sqft_living * 150  # living area
    + sqft_lot * 0.5  # lot size
    + grade * 15_000  # build quality
    + cond_num * 8_000  # condition
    + view * 20_000  # view premium
    + wf_num * 150_000  # waterfront premium
    - age * 500  # depreciation
    + (lat - 47.15) * 200_000  # north = pricier
    + np.random.normal(0, 40_000, n)  # noise
).clip(75_000, 4_000_000)

# =========================
# ASSEMBLE DATAFRAME
# =========================
df = pd.DataFrame(
    {
        "id": np.arange(1000000, 1000000 + n),
        "date": date_str,
        "price": price.astype(int),
        "bedrooms": bedrooms,
        "bathrooms": bathrooms,
        "sqft_living": sqft_living,
        "sqft_lot": sqft_lot,
        "floors": floors,
        "waterfront": waterfront,
        "view": view,
        "condition": condition,
        "grade": grade,
        "sqft_above": sqft_above,
        "sqft_basement": sqft_basement,
        "yr_built": yr_built,
        "yr_renovated": yr_renovated,
        "zipcode": zipcodes,
        "lat": lat.round(4),
        "long": long.round(4),
        "sqft_living15": sqft_living15,
        "sqft_lot15": sqft_lot15,
    }
)

df.to_csv("house_prices1.csv", index=False)
print(f"Dataset saved: {df.shape[0]:,} rows × {df.shape[1]} columns")
print(f"\nPrice stats:")
print(f"  Min:    ${df['price'].min():>12,.0f}")
print(f"  Max:    ${df['price'].max():>12,.0f}")
print(f"  Mean:   ${df['price'].mean():>12,.0f}")
print(f"  Median: ${df['price'].median():>12,.0f}")
