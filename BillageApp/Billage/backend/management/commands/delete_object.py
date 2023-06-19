from django.core.management.base import BaseCommand
from ...models import *

class Command(BaseCommand):
    help = 'Chanages bill status on all useractivebill objects to paid'
    models_dict = {
        'linked_bill': LinkedBill,
        'billage_bill': BillageBill,
        'billage': Billage,
        'user_active_bill_due': UserActiveBillDue,
        'user_bill_details_history': UserBillDetailsHistory,
        'user_bank_account': UserBankAccount,
        'user_credit_card': UserCreditCard,
        'user_payment_method': UserPaymentMethod,
        'linked_bill_split': LinkedBillSplit,
        'sharable_link': ShareableLink,
    }
    
    def user_prompts(self):
        print(self.models_dict.keys())
        delete_from_model = input('Please enter the model name you would like to delete from: ')
        
        while delete_from_model not in self.models_dict.keys():
            print('Invalid entry')
            delete_from_model = input('Please enter the model name you would like to delete from: ')
            
        user_selection = input('Type "ALL" to delete all objects. Type "ONE" to delete a specific object: ')
        
        while user_selection not in ['ALL', 'ONE']:
                print('Invalid entry')
                user_selection = input('Type "ALL" to delete all objects. Type "ONE" to delete a specific object: ')
        
        if user_selection == "ONE":
            object_to_delete = input('Please enter the primary key of the object you would like to delete: ')
        else:
            object_to_delete = 'ALL'
            
        final_confirmation = input("Are you sure you would like to delete the proviced object or objects? Type 'Y' to proceed or 'N' to break: ")
        
        while final_confirmation not in ['Y', 'N']:
            print('Invalid entry')
            final_confirmation = input("Are you sure you would like to delete the provided object or objects? Type 'Y' to proceed or 'N' to break: ")
        
        if final_confirmation == 'N':
            return False, False
        
        return delete_from_model, object_to_delete, 
    
    def delete_object(self, model, object_selection):
        
        model = self.models_dict.get(model)
        
        if object_selection != 'ALL':
            try:
                model.objects.get(pk = object_selection).delete()
                return True
            except:
                return False
            
        try:
            model.objects.all().delete()
            return True
        except:
            return False
        
        
        
    def handle(self, *args, **options):
        
        model_name, object_selection = self.user_prompts()
        
        if not model_name or not object_selection:
            self.stdout.write(self.style.SUCCESS('Exited without deleting objects'))
            return
        
        delete_object = self.delete_object(model_name, object_selection)
        
        if delete_object == True:
            self.stdout.write(self.style.SUCCESS('Successfully Deleted'))
            return

        self.stdout.write(self.style.ERROR('Could Not Delete objects please try again'))
