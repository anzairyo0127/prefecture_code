import os

import pandas

originals_path = "./original"
resources_path = "./resources"

def generate_local_government_data_frame(df: pandas.DataFrame) -> pandas.DataFrame:
    rename_dict = {
        "団体コード": "local_government_code", 
        '都道府県名\n（漢字）': "prefecture_name", 
        '市区町村名\n（漢字）': "city_name"
    }
    new_df = df.loc[:, ["団体コード", "都道府県名\n（漢字）", "市区町村名\n（漢字）"]].rename(columns=rename_dict)
    new_df["local_government_code"] = new_df["local_government_code"].astype("str").str.zfill(6)
    new_df["prefecture_code"] = new_df["local_government_code"].str[:2]
    new_df["city_code"] = new_df["local_government_code"].str[2:5]
    return new_df

def create_local_government_code_zip_from_xlsx(xlsx_file_path: str):
    file_name = os.path.splitext(os.path.basename(xlsx_file_path))[0]
    now_local_governments_df = pandas.read_excel(xlsx_file_path, sheet_name=0) # 現在の団体sheet
    big_citys_df = pandas.read_excel(xlsx_file_path, sheet_name=1) # 政令指定都市sheet
    new_df = generate_local_government_data_frame(pandas.concat([now_local_governments_df, big_citys_df])).sort_values('local_government_code').drop_duplicates()
    print(new_df.tail())
    new_df.to_csv('{}/{}.gzip'.format(resources_path, file_name), index=False, compression="gzip", encoding="UTF-8")

print("create zip ...")
create_local_government_code_zip_from_xlsx("{}/000730858.xlsx".format(originals_path))
print("success")