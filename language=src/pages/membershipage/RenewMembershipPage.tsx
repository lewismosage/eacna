<div>
  <h4 className="text-sm font-medium text-gray-500 mb-2">Member Information</h4>
  <p className="font-medium text-gray-900">{selectedPayment.member_name}</p>
  <p className="text-gray-600">{selectedPayment.member_email}</p>
  
  {/* Add this section for membership type */}
  <div className="mt-2">
    <p className="text-xs text-gray-500">Membership Type</p>
    <p className="font-medium capitalize">
      {selectedPayment.payment_type === 'upgrade' && selectedPayment.new_tier 
        ? selectedPayment.new_tier 
        : selectedPayment.membership_type}
    </p>
  </div>
</div> 