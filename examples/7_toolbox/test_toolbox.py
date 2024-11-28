import pandas as pd
from lightweight_charts import Chart
from lightweight_charts.toolbox import Tool

if __name__ == "__main__":
    chart = Chart(toolbox=True)
    chart.toolbox.hide_tool(Tool.BOX)

    # Columns: time | open | high | low | close | volume
    df = pd.read_csv("ohlcv.csv")
    chart.set(df)

    chart.show(block=True)
