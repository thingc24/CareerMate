package vn.careermate.common.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import vn.careermate.common.dto.CompanyDTO;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "content-service")
public interface ContentServiceClient {
    @GetMapping("/companies/{companyId}")
    CompanyDTO getCompanyById(@PathVariable UUID companyId);
    
    @GetMapping("/companies")
    List<CompanyDTO> getAllCompanies();
}
