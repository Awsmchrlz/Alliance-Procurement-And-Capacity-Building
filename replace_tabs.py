import sys

def replace_lines(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()

    # registrations 2841-3477
    # sponsorships 3798-4063
    # exhibitions 4066-4299
    
    # We replace from bottom to top so line numbers don't shift for earlier replacements!
    
    # 3. Exhibitions (4066 to 4299)
    start = 4066 - 1
    end = 4299
    exhibitions_replacement = """          <TabsContent value="exhibitions">
            <ExhibitionsTab 
              exhibitions={exhibitions} 
              canManageFinance={canManageFinance}
              setShowCreateExhibitionDialog={setShowCreateExhibitionDialog}
              handleStatusChange={handleStatusChange}
            />
          </TabsContent>
"""
    lines = lines[:start] + [exhibitions_replacement] + lines[end:]

    # 2. Sponsorships (3798 to 4063)
    start = 3798 - 1
    end = 4063
    sponsorships_replacement = """          <TabsContent value="sponsorships">
            <SponsorshipsTab 
              sponsorships={sponsorships} 
              canManageFinance={canManageFinance}
              setShowCreateSponsorshipDialog={setShowCreateSponsorshipDialog}
              handleStatusChange={handleStatusChange}
            />
          </TabsContent>
"""
    lines = lines[:start] + [sponsorships_replacement] + lines[end:]

    # 1. Registrations (2841 to 3477)
    start = 2841 - 1
    end = 3477
    registrations_replacement = """          <TabsContent value="registrations">
            <RegistrationsTab
              title="Registration Management"
              registrations={registrations}
              canManageFinance={canManageFinance}
              handlePaymentStatusChange={(id, status) => handlePaymentStatusChange(id, status)}
              extraActions={
                <>
                  <Button
                    onClick={() => setShowEventRegistrationDialog(true)}
                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-sm transition-all duration-300 min-h-[40px] text-sm"
                  >
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">
                      Register User
                    </span>
                  </Button>
                  <Button
                    onClick={() => exportToExcel("registrations")}
                    variant="outline"
                    className="text-[#1C356B] border-[#1C356B] hover:bg-[#1C356B]/10 min-h-[40px] text-sm"
                  >
                    <Download className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">
                      Export
                    </span>
                  </Button>
                </>
              }
            />
          </TabsContent>
"""
    lines = lines[:start] + [registrations_replacement] + lines[end:]

    with open(filepath, 'w') as f:
        f.writelines(lines)

replace_lines('client/src/pages/admin-dashboard.tsx')
