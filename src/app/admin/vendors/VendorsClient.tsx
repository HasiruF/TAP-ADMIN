'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ListingsTable } from '@/components/admin/vendors/ListingsTable'
import { CategoriesTable } from '@/components/admin/vendors/CategoriesTable'

export default function VendorsClient() {
  return (
    <div className="space-y-8">
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '52px' }}>
          Vendor Management
        </h1>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Manage the Marketplace category taxonomy and vendor listings shown on
          the public site.
        </p>
      </div>

      <Tabs defaultValue="listings">
        <TabsList>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="listings" className="pt-6">
          <ListingsTable />
        </TabsContent>
        <TabsContent value="categories" className="pt-6">
          <CategoriesTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
