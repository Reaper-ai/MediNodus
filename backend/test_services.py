from app.services.pipeline import MediNodusPipeline
import os
import sys

def run_test(image_path, doc_type, previous_info=""):
    """
    Run pipeline for specific document type
    """
    print(f"\n=== TESTING {doc_type.upper()} ===")
    
    # Initialize pipeline
    pipeline = MediNodusPipeline()
    
    try:
        result = pipeline.process(image_path, doc_type, previous_info)
        print("✅ SUCCESS! Output:")
        print(result)
        return result
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return None

if __name__ == "__main__":
    # Default test image path
    IMAGE_PATH = r"D:\Downloads\test_report.png"  # Change this to your actual path
    
    # You can override from command line
    if len(sys.argv) > 1:
        IMAGE_PATH = sys.argv[1]
    if len(sys.argv) > 2:
        DOC_TYPE = sys.argv[2]  # "report" or "medicine"
    else:
        DOC_TYPE = "report"  # Default to report
    
    # Validate doc_type
    if DOC_TYPE not in ["report", "medicine"]:
        print("❌ Invalid doc_type. Use 'report' or 'medicine'")
        sys.exit(1)
    
    # Run test
    result = run_test(IMAGE_PATH, DOC_TYPE)
    
    # Optional: Save output to file
    if result:
        output_file = f"output_{DOC_TYPE}.json"
        import json
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        print(f"📝 Saved output to {output_file}")