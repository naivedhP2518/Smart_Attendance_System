import json
import os
import random
from datetime import datetime
import pandas as pd

def main():
    # Read the temporary attendance JSON written by Node.js
    tmp_path = os.path.join(os.path.dirname(__file__), "temp_attendance.json")
    
    if not os.path.exists(tmp_path):
        print("No temp attendance payload found.")
        return

    with open(tmp_path, "r") as f:
        data = json.load(f)

    subject_code = data.get("subjectCode", "UNKNOWN")
    class_name = data.get("className", "General")
    present_students_set = set(data.get("present", []))

    # Mock full student roster to emulate database fetch
    # Generate 100 dummy students mapping to the seed data
    all_students = [f"STU{str(i).zfill(3)}" for i in range(1, 101)]
    
    # If a real database was used, it would fetch all students enrolled in 'subject_code'

    records = []
    for s_id in all_students:
        status = "Present" if s_id in present_students_set else "Absent"
        records.append({
            "Student ID": s_id,
            "Class": class_name,
            "Subject Code": subject_code,
            "Date": datetime.now().strftime("%Y-%m-%d"),
            "Status": status
        })

    # Add the ones that scanned but aren't in dummy list
    for s_id in present_students_set:
        if s_id not in all_students:
           records.append({
               "Student ID": s_id,
               "Class": class_name,
               "Subject Code": subject_code,
               "Date": datetime.now().strftime("%Y-%m-%d"),
               "Status": "Present"
           })

    # Create DataFrame
    df = pd.DataFrame(records)

    # Make target dir if not exist
    out_dir = os.path.join(os.path.dirname(__file__), "attendance_records")
    os.makedirs(out_dir, exist_ok=True)

    date_str = datetime.now().strftime("%Y_%m_%d_%H%M%S")
    # Include class_name in filename
    safe_class_name = class_name.replace(" ", "_")
    file_name = f"attendance_{safe_class_name}_{date_str}_{subject_code}.xlsx"
    out_path = os.path.join(out_dir, file_name)

    # Generate Excel file
    df.to_excel(out_path, index=False)

    print(f"Successfully generated Excel sheet for {class_name}: {out_path}")

if __name__ == "__main__":
    main()
