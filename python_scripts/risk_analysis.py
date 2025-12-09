import sys
import json
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor

# Cấu hình hiển thị console trên Windows để tránh lỗi font
if sys.platform.startswith('win'):
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def generate_mock_historical_data(num_samples=1000):
    """
    Tạo dữ liệu giả lập lịch sử để huấn luyện AI, bao gồm Điểm rèn luyện.
    """
    np.random.seed(42)
    
    data = {
        'gpa': np.random.uniform(0.0, 4.0, num_samples),
        'training_score': np.random.randint(40, 100, num_samples), # Điểm rèn luyện (Thang 100)
        'absences': np.random.randint(0, 20, num_samples),
        'tuition_debt': np.random.choice([0, 1], num_samples, p=[0.8, 0.2]),
        'lms_logins': np.random.randint(0, 100, num_samples),
        'library_visits': np.random.randint(0, 50, num_samples)
    }
    
    df = pd.DataFrame(data)
    
    # --- Logic tạo nhãn Rủi ro (AI sẽ học quy luật này) ---
    def calculate_hidden_risk(row):
        score = 0
        score += (4.0 - row['gpa']) * 15         # GPA thấp -> Rủi ro
        score += row['absences'] * 4             # Vắng học -> Rủi ro
        
        # LOGIC MỚI: Điểm rèn luyện thấp làm tăng rủi ro rất mạnh
        # Nếu ĐRL < 50 (Yếu) -> Rủi ro tăng vọt (+25 điểm)
        # Nếu ĐRL > 80 (Tốt) -> Rủi ro giảm (-5 điểm)
        if row['training_score'] < 50:
            score += 25
        elif row['training_score'] > 80:
            score -= 5
        else:
            score += (80 - row['training_score']) * 0.5 # Điểm càng thấp rủi ro càng tăng nhẹ

        score += row['tuition_debt'] * 30        # Nợ tiền -> Rủi ro cực cao
        score -= row['lms_logins'] * 0.2         # Chăm online -> Giảm rủi ro
        score -= row['library_visits'] * 0.1     # Chăm đọc sách -> Giảm rủi ro
        
        # Thêm nhiễu ngẫu nhiên
        score += np.random.normal(0, 2)
        return min(max(score, 0), 100)

    df['risk_score'] = df.apply(calculate_hidden_risk, axis=1)
    return df

def train_and_predict(input_data):
    # 1. Huấn luyện mô hình
    historical_df = generate_mock_historical_data()
    
    # Thêm 'training_score' vào danh sách đặc trưng (features)
    features = ['gpa', 'training_score', 'absences', 'tuition_debt', 'lms_logins', 'library_visits']
    
    X_train = historical_df[features]
    y_train = historical_df['risk_score']
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # 2. Chuẩn bị dữ liệu dự đoán
    current_students = pd.DataFrame(input_data)
    
    # Xử lý dữ liệu thiếu (Data Imputation)
    for col in features:
        if col not in current_students.columns:
            if col == 'training_score':
                current_students[col] = 70 # Mặc định Khá nếu thiếu
            elif col == 'tuition_debt':
                current_students[col] = 0
            else:
                current_students[col] = 0

    X_predict = current_students[features]
    
    # 3. Dự đoán
    predicted_scores = model.predict(X_predict)
    current_students['risk_score'] = predicted_scores.round(2)
    
    # 4. Phân loại mức độ
    def get_status(score):
        if score >= 70: return 'High Risk'   # Nguy cơ đuổi học
        if score >= 40: return 'Medium Risk' # Cảnh báo học vụ
        return 'Low Risk'                    # An toàn

    current_students['risk_status'] = current_students['risk_score'].apply(get_status)
    
    # Trả về kết quả
    return current_students[['id', 'name', 'risk_score', 'risk_status', 'gpa', 'training_score']]

def main():
    try:
        if len(sys.argv) < 2:
            print(json.dumps({"error": "No data provided"}))
            sys.exit(1)

        input_json = sys.argv[1]
        data = json.loads(input_json)
        
        if not data:
             print(json.dumps([]))
             return

        result_df = train_and_predict(data)
        print(result_df.to_json(orient='records'))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()