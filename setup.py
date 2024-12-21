from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as f:
    long_description = f.read()

setup(
    name="plutus_lightweight_charts",
    version="2.2.0",
    packages=find_packages(),
    python_requires=">=3.8",
    install_requires=[
        "pandas",
        "pywebview>=5.0.5",
    ],
    package_data={
        "lightweight_charts": ["js/*"],
    },
    author="plutus",
    license="MIT",
    description="Fork of lightweight-charts-python with Plutus specific enchancements.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/plutus-terminal/plutus-lightweight-charts-python",
)
