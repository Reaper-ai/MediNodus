from backend.app.models.medical_record import MedicalReport

async def get_or_create_report(user):
    report = await MedicalReport.find_one(
        MedicalReport.user_id == str(user.id)
    )

    if not report:
        report = MedicalReport(
            user_id=str(user.id),
            email=user.email,
            history=[]
        )
        await report.insert()

    return report
